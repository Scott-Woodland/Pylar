import kaboom from "kaboom"
kaboom({
    scale: 1,
    background: [ 235, 100, 100, ],
})
const baseSpeed = 150;
let speed = baseSpeed;
let camSpeed = 150;
const acc = 4;
const maxSpeed = 400;
let timer = 0;
let isAccel = false;
let moveX = 0;
let moveY = 0;
const friction = 16;
let camFriction = 30;
const startOffset = height() * 0.3;
let jumps = 0;

loadSprite("bean", "sprites/PylarSpriteSheet.png", {
    "width": 2048,
    "height": 2048,
    "sliceX": 16,
    "sliceY": 16,
    "anims": {
        "idle": {
            "from": 0,
            "to": 15,
            "speed": 10,
            "loop": true
        },
        "punch": {
            "from": 16,
            "to": 22,
            "speed": 10,
            "loop": false
        },
        "run": {
            "from": 23,
            "to": 28,
            "speed": 10,
            "loop": true
        },
}})
let bean = add([
    origin("bottom"),
	sprite("bean",{
        anim: "idle",
    }),
    body(),
    area( {width: 56, height: 100 }),
    pos(width() * 0.5, height() * 0.75),
    origin('center'),
    scale(0.8),
    rotate(0),
    "bean"
])
let debugText = add([
    origin("center"),
    text(isAccel),
    pos (width() * 0.5, height() * 0.2),
    { value: 0 },
])
let beanPos = vec2(bean.pos.x, bean.pos.y - startOffset)

onUpdate(() => {
    beanPos = vec2(bean.pos.x, bean.pos.y - startOffset)
    bean.move(moveX * speed, 0);
    camPos(camPos().x + (moveX * camSpeed) * dt(), height() * 0.75 - startOffset);;
    if (isAccel == true) {
        if (speed < maxSpeed){
            speed = speed + acc;         
        }
        if (camSpeed < maxSpeed){
            camSpeed = speed + 40;     
        }
    }
    else {
        if (speed > 0){
            speed = (speed - friction);
        }
        else {
            speed = 0;
            if (bean.curAnim() == "run"){
                bean.play("idle"); 
            }
        }  
        if (camSpeed > 0){
            camSpeed = (camSpeed - camFriction);
        }
        else {
            camSpeed = 0;
            camPos(beanPos.x,camPos().y);
        }   
    }
    if (bean.curAnim() == null){
        if(isAccel){
           bean.play("run"); 
        }
        else{
        bean.play("idle");      
        }
    }
    if (beanPos.y > 7000){
        console.log("Out Of Bounds");
        bean.pos = vec2(width() * 0.5, height() * 0.75);
        beanPos = vec2(bean.pos.x, bean.pos.y - startOffset);
    }
    if (bean.isGrounded()){
        jumps = 0;
    }
    
    debugText.text = "  " + jumps + "  " + isAccel;
    readd(debugText);
})

onCollide("bean", "ground", (a,b,c) => {
    let d
    if (c == null){
        d = vec2(0,0);
        console.log("saved your ass")
    }
    else{
        d = vec2(c.displacement.x, c.displacement.y)
    }
    console.log(d);
    if(d.y == 0){
       camSpeed = 0; 
    }
})
bean.onCollide(() => {
    isAccel = false;
})
onKeyDown("a", () => {
    moveX = -1;
    bean.flipX(true);
});
onKeyPress("a", () => {
    speed = baseSpeed;
    isAccel = true
    bean.play("run");
});
onKeyRelease("a", () => {
    isAccel = false;
});
onKeyDown("d", () => {
    moveX = 1;    
    bean.flipX(false);
});
onKeyPress("d", () => {
    speed = baseSpeed;
    isAccel = true
    bean.play("run");
});
onKeyRelease("d", () => {
    isAccel = false;
});
onKeyPress("space", () => {
    bean.stop()
    bean.play("punch");
});
onKeyPress("w", () => {
    if (bean.isGrounded() || jumps < 2){
        bean.jump(700);  
        jumps++
    }
});

add ([
    origin("top"),
    rect(5000 ,100),
    pos (width() * 0.5, height() * 0.9),
    area({ width: 5000, height: 100 }),
    solid(),
    color(60,60,60),
    "ground"
])

add ([
    origin("top"),
    rect(200 ,10),
    pos (width() * 0.5 + 500, height() * 0.9 - 165),
    area({ width: 200, height: 10 }),
    solid(),
    color(60,60,60),
    "ground"
])
add ([
    origin("top"),
    rect(300 ,40),
    pos (width() * 0.5 - 700, height() * 0.6 - 100),
    area({ width: 300, height: 40 }),
    solid(),
    color(60,60,60),
    "ground"
])
add ([
    origin("top"),
    rect(100 ,40),
    pos (width() * 0.5, height() * 0.5),
    area({ width: 100, height: 40 }),
    solid(),
    color(60,60,60),
    "ground"
])
add ([
    origin("top"),
    rect(400 ,150),
    pos (width() * 0.5 + 200, height() * 0.9 - 50),
    area({ width: 400, height: 150 }),
    solid(),
    color(60,60,60),
    "ground"
])
