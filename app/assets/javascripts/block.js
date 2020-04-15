// 変数の初期化（定数の宣言）
var CANVAS_W = 640, CANVAS_H = 700;   /* サイズの指定  */
var STAGE_COL = 8, STAGE_ROW = 20;    /* ブロック個数 */
var BLOCK_W = CANVAS_W / STAGE_COL;   /* ブロックの横幅 */
var BLOCK_H = CANVAS_H / STAGE_ROW;   /* ブロックの高さ */
var PAD_W = BLOCK_W / 20;             /* ブロックの余白 */
var BALL_W = BLOCK_H / 4;             /* ボールのサイズ */
var BALL_SPEED = BALL_W * 2.0;        /* ボールの移動量 */
var BAR_SPEED = BALL_W * 3;           /* バーの移動量 */
var BAR_W = BLOCK_W * 2;              /* バーの横幅 */
var BAR_Y = CANVAS_H - BLOCK_H * 2;   /* バーのY座標の位置 */
var INTERVAL = 70;                    /* ボールを移動するタイマーの感覚 */
var STAGE_D = [                       /* ステージデータ */  
  [0,0,0,0,0,0,0,0],
  [0,1,0,0,0,0,1,0],
  [0,0,1,0,0,1,0,0],
  [0,0,1,1,1,1,0,0],
  [0,1,2,1,1,2,1,0],
  [0,1,2,1,1,2,1,0],
  [0,1,1,1,1,1,1,0],
  [0,1,1,2,2,1,1,0],
  [0,1,1,1,1,1,1,0],
  [0,0,1,0,0,1,0,0],
  [0,1,1,0,0,1,1,0]
];
// ブロックの色
var BCOLOR = ["#000000", "#EE00FF", "#FF0000"];
// ゲーム中で利用する変数の宣言
var aCanvas, ctx;         /* 描画用オブジェクト */
var stage = [];           /* ステージデータ */
var barX;                 /* バーのx座標 */
var barSX;                /* バーの移動方向 */
var ballX, ballY;         /* ボールの座標 */
var ballSX, ballSY;       /* ボールの移動方向 */
var score;                /* スコア */
var bgstyle;              /* 背景グラデーション描画用 */
var isPlaying = false;    /* ゲーム中かどうかを表す */


// 初期イベント
window.onload = function () {
  // 描画用コンテキストの取得
  aCanvas = $("aCanvas");
  ctx = aCanvas.getContext("2d");
  // グラデーションの背景を生成
  bgstyle = ctx.createLinearGradient(0,0,600,0);
  bgstyle.addColorStop(0, 'black'); 
  bgstyle.addColorStop(0.5, '#303030'); 
  bgstyle.addColorStop(1, 'black');
  // マウスイベントを設定
  aCanvas.onclick = checkStart;
  aCanvas.onmousedown = mouseHandler;
  aCanvas.ontouchstart = touchHandler;
  // 加速度センサーイベント
  window.ondevicemotion = motionHandler;
  // キーボードイベントを設定
  window.onkeydown = keyHandler;
  // ゲームデータの初期化を実行
  initGame(); 
};

// ゲームデータの初期化
function initGame() {
  // ステージデータを初期化
  stage = [];
  for (var y = 0; y < STAGE_ROW; y++) {
    var a = stage[y] = [];
  for (var x = 0; x < STAGE_COL; x++) {
    a[x] = (STAGE_D.length > y)
          ? STAGE_D[y][x] : 0;
    }
  }
  // バーやボールなどの座標を初期化
  barX = (CANVAS_W - BAR_W) / 2;
  barSX = BAR_SPEED;
  ballX = (CANVAS_W - BALL_W) / 2;
  ballY = BAR_Y - BALL_W * 2;
  ballSX = BALL_SPEED;   //BAR_SPEEDになってて表示しなかった
  ballSY = BALL_SPEED;
  score = 0;
  drawStage();
}

// ターンを進める
function nextTurn() {
  if (!isPlaying) return;
  // バーを動かす
  barX += barSX;
  if (barX < 0) barX = 0;
  if (barX > (CANVAS_W - BAR_W)) {
    barX = CANVAS_W - BAR_W;
  }
  // ボールを動かす
  var lw = CANVAS_W - PAD_W;
  var tx = ballX + ballSX;
  var ty = ballY + ballSY;  //＋を＝にしててボールが動かなかった
  // 壁があるか
  if (tx < PAD_W || tx > lw) {
    ballSX = BALL_SPEED;
    ballSX *= (tx < PAD_W) ? 1 : -1;
    tx = ballX + ballSX * 2; 
  }
  if (ty < PAD_W) {
    ballSY *= -1;
    ty = ballY + ballSY;
  }
  // バーがあるか
  var barX2 = barX + BAR_W;
  if (barX <= ballX && ballX <= barX2 && ballY > (BAR_Y - BALL_W * 2)) {
    ballSY *= -1;
    ty = ballY + ballSY * 2;
  }
  // ブロックがあるか
  var bx = Math.floor(tx / BLOCK_W);
  var by = Math.floor(ty / BLOCK_H);
  var c = stage[by][bx];
  if (c > 0) {
    revBallSX();
    ballSY *= -1;
    stage[by][bx] = 0;   /* ブロックを崩す */
    score++;
    if (checkClrar()) {
      drawStage();
      alert("GAME CLEAR!");
      isPlaying = false;
      initGame();
      return;
    }
  }
  ballX = tx; ballY = ty;
  drawStage();
  // ゲームオーバー判定
  if (ty >= CANVAS_H - BLOCK_H) {
    alert("GAME OVER!\nSCORE=" + score);
    initGame();
    isPlaying = false;
    return;
  }
  // 次のターンをセット
  setTimeout(nextTurn, INTERVAL);
}
// ボールの向きをランダムに変える
function revBallSX() {
  var x = Math.random() * BALL_SPEED * 1.2;
  ballSX = x * ((ballSX < 0) ? 1 : -1);
}
// 画面の描画
function drawStage() {
  // 画面初期化
  ctx.fillStyle = bgstyle;
  ctx.fillRect(0,0,CANVAS_W,CANVAS_H);
  // 画面の緑を描画
  ctx.fillStyle = "blue";
  ctx.fillRect(0,0,CANVAS_W,PAD_W);
  ctx.fillRect(0,0,PAD_W,CANVAS_H);
  ctx.fillRect(CANVAS_W - PAD_W,0,PAD_W,CANVAS_H);
  // ブロックを描画
  each2a(stage, function (x, y, c) {
    if (c <= 0) return true;
    var rx = x * BLOCK_W + PAD_W;
    var ry = y * BLOCK_H + PAD_W;
    ctx.fillStyle = BCOLOR[c];
    ctx.fillRect(rx, ry, BLOCK_W - PAD_W * 2, BLOCK_H - PAD_W * 2);
    return true;
  });
  // ボールを描画
  ctx.beginPath();
  ctx.fillStyle = "white";
  ctx.arc(ballX, ballY, BALL_W, 0, Math.PI * 2, false);  //Math.PTにしててコンソールログしても中身が入らなかった
  ctx.fill();
  // バー描画
  ctx.fillStyle = "red";
  ctx.fillRect(barX, BAR_Y, BAR_W, 8);

}
// キーボードのキーが押された時
function keyHandler(e) {
  switch (e.keyCode) {
    case 37: //left
      barSX = -1 * BAR_SPEED;
      break;
    case 39: //right
      barSX = BAR_SPEED;
      break;
    case 32: //space
    case 13: //return
      checkStart();
      break;
    default:
      // console.log("PUSH:" + e.keyCode);
  }
}
// マウスボタンが押された時
function mouseHandler(e) {
  // 座標を得る
  var x = e.clientX;
  var r = e.target.getBoundingClientRect();
  x -= r.left;
  checkMove(x);
}

// スマートフォンで画面がタッチされた時
function touchHandler(e) {
  // タッチされた座標を得る
  var p = e.touches[0];
  var x = p.clientX;
  var r = e.target.getBoundingClientRect();
  x -= r.left;
  checkMove(x);
}

function checkMove(x) {
  // 現在のバーの中央を調べる
  var cx = barX + BAR_W / 2;
  if (x < cx) {
    barSX = -1 * BAR_SPEED;
  } else {
    barSX = BAR_SPEED;
  }
}

// 加速度センサーからの入力があった時
function motionHandler(e) {
  var acc = e.accelerationIncludingGravity;
  if (acc.x < 0) {
    barSX = -1 * BAR_SPEED;
  } else {
    barSX = BAR_SPEED;
  }
  // Androidでは逆方向となる
  if (navigator.userAgent.indexOf('Android') > 0) {
    barSX *= -1;
  }
}

// ゲームを開始する
function checkStart() {
  if (isPlaying) return;
  isPlaying = true;
  nextTurn();
}

// クリアしたか確認する
function checkClrar() {
  var blocks = 0;;  //ブロックの数を数える
  each2a(stage, function(x, y, c) {
    if (c > 0) blocks++;
    return true;
  });
  return (blocks == 0);
}

// 2次元配列の各要素に対して関数fを実行
function each2a(ary, f) {
  for (var y = 0; y < ary.length; y++) {
    var a = ary[y];
    for (var x = 0; x < a.length; x++) {
      if (!f(x, y, a[x])) return false;
    }
  }
  return true;
}
function $(id) {
  return document.getElementById(id);
}