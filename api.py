from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import numpy as np
import json
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],   # Allow all headers
)

   
class Environment:
    def __init__(self, board_length):
        self.board_length = board_length
        self.board = [0] * (board_length ** 2)
        self.winner = 0
        self.ended = False
        self.player_turn = 1

    def get_cell(self, i, j):
        return self.board[j * self.board_length + i]

    def set_cell(self, i, j, value):
        self.board[j * self.board_length + i] = value

    def grid_select(self, index):
        if self.board[index] != 0:
            return False
        self.board[index] = self.player_turn
        if self.is_game_over():
            self.ended = True
        else:
            self.player_turn *= -1

    def reset_game(self):
        self.board = [0] * (self.board_length ** 2)
        self.winner = 0
        self.ended = False
        self.player_turn = 1

    def get_reward(self, player):
        if not self.is_game_over():
            return 0
        return 1 if self.winner == player else 0

    def get_state(self):
        state_hash = 0
        for idx, cell in enumerate(self.board):
            state_hash += (3 ** idx) * (cell + 1)
        return state_hash

    def is_game_over(self):
        for i in range(0, self.board_length * self.board_length, self.board_length):
            if self.check_if_player_won(sum(self.board[i:i + self.board_length])):
                return True

        for i in range(self.board_length):
            if self.check_if_player_won(sum(self.board[i::self.board_length])):
                return True
        for start in range(self.board_length -2):
            if self.check_if_player_won(sum(self.board[i] for i in range(start, self.board_length * (self.board_length - start), self.board_length + 1))):
                return True

        # Top-right to bottom-left
        for start in range(self.board_length - 1, 1, -1):
            if self.check_if_player_won(sum(self.board[i] for i in range(start, self.board_length * (self.board_length - start), self.board_length - 1))):
                return True


        if all(cell != 0 for cell in self.board):
            self.ended = True
            return True
        return False

    def check_if_player_won(self, sum):
        if sum == -3:
            self.winner = -1
            return True
        elif sum == 3:
            self.winner = 1
            return True
        return False

class TrainRequest(BaseModel):
    agent1_explore_probability: float
    agent1_learning_rate: float
    agent2_explore_probability: float
    agent2_learning_rate: float
    episodes: int
# Global variables to maintain state

def get_state_hash_and_winner(env, i=0, j=0, length=2):
    results = []
    options = [0, -1, 1]  # Empty cell, Player 2, Player 1

    for v in options:
        env.set_cell(i, j, v)
        
        if j == length:
            if i == length:
                # If we're at the last cell in the board, check the state
                state = env.get_state()
                ended = env.is_game_over()
                winner = env.winner
                results.append((state, winner, ended))
            else:
                # Move to the next row
                results.extend(get_state_hash_and_winner(env, i + 1, 0, length=length))
        else:
            # Move to the next column in the current row
            results.extend(get_state_hash_and_winner(env, i, j + 1, length=length))

    return results
import json 
for i in range(3, 10):
    environment = Environment(i)
    print(i)
    state_winner_triples = get_state_hash_and_winner(environment, length=i-1)
    with open(f"data.{i}.json", "w") as file:
        json.dump(state_winner_triples, file, indent=4)  

# @app.get("/", response_class=HTMLResponse)
# async def root():
#     with open("index.html") as f:
#         return HTMLResponse(content=f.read())



# @app.post("/train")
# async def train_agents():
#     try:

#         state_winner_triples = get_state_hash_and_winner(environment)
#         print(state_winner_triples)
#     except KeyboardInterrupt:
#         print("\nProcess interrupted by user. Exiting gracefully...")
#         return ''
#     return json.dumps(state_winner_triples)

# To run the server, use the following command in terminal:
# uvicorn main:app --reload
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8433, reload=True)