
class Environment{

  constructor(board_length){
    this.board = [];
    this.board_length = board_length;
    this.p1 = 1;
    this.p2 = -1;
    this.count_1 = 0;
    this.count_2 = 0;
    this.winner = 0;
    this.prev2 = []
    this.prev1 = []
    this.ended = false;
    this.num_states = Math.pow(3,this.board_length*this.board_length);
    this.player_turn = 1;
    for(let i=0;i<Math.pow(this.board_length,2);i++){
      this.board.push(0);
    }
  }

  get_cell(i, j){
    return parseInt(this.board[(j*this.board_length)+i]);
  }


  set_cell(i, j, value){
    // console.log(i, j, value);
    this.board[(j*this.board_length)+i] = parseInt(value);
  }

  cell_is_empty(i, j){
    return this.get_cell(i, j) == 0;
  }

  grid_select(index, show_ui=true){
    if(this.board[index] != 0){
      return false;
    }

    this.board[index] = this.player_turn;
    if(show_ui){
      let thisid = "#btn_ttt_click"+index.toString();
      if(this.player_turn == 1){
        $(thisid).toggleClass('white red');
        $(thisid).text('O')
      }else{
        $(thisid).toggleClass('white green');
        $(thisid).text('X')
      }

    }

    if(this.is_game_over()){
        
        if (this.prev2.length === 2 && show_ui) {
            this.prev2.forEach(items => {
                items.forEach((item, i) => {
                    let thisid = "#btn_ttt_click" + item.toString();
                    if (!$(thisid).hasClass('blue') && !$(thisid).hasClass('yellow')) {
                        $(thisid).toggleClass('blue yellow');
                    }
                });
            });
        }
        if (this.prev1.length === 2 && show_ui) {
            this.prev1.forEach(items => {
                items.forEach((item, i) => {
                    let thisid = "#btn_ttt_click" + item.toString();
                    if (!$(thisid).hasClass('blue') && !$(thisid).hasClass('yellow')) {
                        $(thisid).toggleClass('blue yellow');
                    }
                });
            });
        }
      this.ended = true;
      // console.log('game ended, winner ', this.winner)
    }else{
      this.player_turn = this.player_turn * -1;
    }

  }

  reset_game(reset_player=true, show_ui=true){
    this.winner = 0;
    // this.board = [];

    for(let i=0;i<Math.pow(this.board_length,2);i++){
      // this.board.push(0);
      if(show_ui){
        let thisid = "#btn_ttt_click"+i.toString();
        // if(this.board[i] == 1){
        //   $(thisid).toggleClass('red white');
        // }else if(this.board[i] == -1){
        //   $(thisid).toggleClass('green white');
        // }
        $(thisid).removeClass("green");
        $(thisid).removeClass("red");
        $(thisid).removeClass("blue");
        $(thisid).removeClass("yellow");
        $(thisid).addClass("white");
        $(thisid).text('.');
      }
      this.board[i] = 0;
    }

    this.ended = false;
    this.count_1 = 0
    this.count_2 = 0
    this.prev2 = []
    this.prev1 = []
    if(reset_player){
      this.player_turn = 1;
    }
  }

  get_reward(player){
    if(!this.is_game_over()){
      return 0;
    }
    if(this.winner == player){
      return 1;
    }else{
      return 0;
    }
  }

  get_state(){
    let v = 0;
    let k = 0;
    let hashnum = 0;

    for(let i=0;i<this.board_length;i++){
      for(let j=0;j<this.board_length;j++){
        if(this.get_cell(i,j) == 0){
          v = 0;
        }else if (this.get_cell(i,j) == this.p2){
          v = 1;
        }else if (this.get_cell(i,j) == this.p1){
          v = 2;
        }

        hashnum += Math.pow(3,k) * v;
        k++;

        // console.log(i, j, this.get_cell(i,j), v, h, k)
      }
    }
    return hashnum;
  }

  hasThreeConsecutive(arr, indexs) {
    for (let i = 0; i < arr.length - 3; i++) {
        if ((arr[i] === 1 && arr[i + 1] === 1 && arr[i + 2] === 1  && arr[i + 3] === 1)){
            this.winner = 1; 
            let a = [indexs[i], indexs[i+1], indexs[i+2], indexs[i+3]]
            if (!this.prev1.some(prev => 
                prev[0] === a[0] && 
                prev[1] === a[1] && 
                prev[2] === a[2] && 
                prev[3] === a[3])) {
                this.prev1.push(a);
                this.count_1 += 1;
            
                return true;
            }

        }
        if (arr[i] === -1 && arr[i + 1] === -1 && arr[i + 2] === -1 && arr[i + 3] === -1){
            this.winner = -1;

            let a = [indexs[i], indexs[i+1], indexs[i+2], indexs[i+3]]
            if (!this.prev2.some(prev => 
                prev[0] === a[0] && 
                prev[1] === a[1] && 
                prev[2] === a[2] && 
                prev[3] === a[3])) {
                
                this.prev2.push(a);
                this.count_2 += 1;
            
                return true;
            }
            return true;
        }
    }
    return false;
}
  getDiagonalSum(start, step, end) {
    let total = 0;
    let arr = []
    let indexs = []
    for (let i = start; i < end; i += step) {
        arr.push(this.board[i])
        indexs.push(i)

    }
    return { arr, indexs };
    }
  is_game_over(test_board=[]){
    if(test_board.length==0){
      test_board = this.board;
    }

    for(let i=0;i<(this.board_length*this.board_length);i+=this.board_length){
      let arr = []
      let indexs = []
      for(let j=i;j<i+this.board_length;j+=1){
        arr.push(test_board[j])
        indexs.push(j)
      }
      if(this.hasThreeConsecutive(arr, indexs)){
        if (this.count_2===2 || this.count_1===2) {
            return true;
        }
 
      }

    }

    // columns
    for(let i=0;i<this.board_length;i+=1){
      let arr = []
      let indexs = []
      for(let j=i;j<this.board_length*this.board_length; j+=this.board_length){
        arr.push(test_board[j])
        indexs.push(j)

      }

      if(this.hasThreeConsecutive(arr, indexs)){
        if (this.count_2===2 || this.count_1===2) {
            return true;
        }
      }
    }

    // diagonals

    for (let start = 0; start < this.board_length - 3; start++) {
        let { arr, indexs } = this.getDiagonalSum(start, this.board_length + 1, this.board_length*(this.board_length - start));
        if(this.hasThreeConsecutive(arr, indexs)){
            if (this.count_2===2 || this.count_1===2) {
                return true;
            }
          }
    }
    for (let start = this.board_length; start < this.board_length*(this.board_length-1)+1; start+=this.board_length) {
        let { arr, indexs } = this.getDiagonalSum(start, this.board_length + 1, this.board_length**2);
        if(this.hasThreeConsecutive(arr, indexs)){
            if (this.count_2===2 || this.count_1===2) {
                return true;
            }
          }
    }

    // Check diagonals from top-right to bottom-left
    for (let start = this.board_length - 1; start > 0; start--) {
        let { arr, indexs } = this.getDiagonalSum(start, this.board_length - 1, this.board_length*(start) + 1);
        if(this.hasThreeConsecutive(arr, indexs)){
            if (this.count_2===2 || this.count_1===2) {
                return true;
            }
        }
    }
    for (let start = this.board_length*2-1; start < this.board_length*(this.board_length-3); start+=this.board_length) {
        let { arr, indexs } = this.getDiagonalSum(start, this.board_length - 1, this.board_length**2-3);
        if(this.hasThreeConsecutive(arr, indexs)){
            if (this.count_2===2 || this.count_1===2) {
                return true;
            }
        }
    }


    let has_no_zeros = true;
    for(let i=0;i<this.board_length*this.board_length;i+=1){
      if(test_board[i] == 0){
        has_no_zeros = false;
        break;
      }
    }
    if(has_no_zeros){
      this.ended = true;
      return true;
    }

    return false;
  }



}
