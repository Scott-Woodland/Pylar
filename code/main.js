import kaboom from "kaboom"
kaboom({
    scale: 1,
    width: 1920,
    height: 1080,
    stretch: true,
    letterbox: true,
    background: [ 235, 100, 100, ],
})
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

scene("start", () => {
    let menuText = add([
        origin("center"),
        text("Press F to start"),
        pos (width() * 0.5, height() * 0.5),
        { value: 0 },
    ])
    
    onKeyPress("f", (c) => {
        fullscreen(!isFullscreen())
        go("main");  
    })
})
go("start");
scene("main", () => {
let baseSpeed = 150;
let speed = baseSpeed;
let camSpeed = 150;
let acc = 10;
let camAcc = 40;
let maxSpeed = 500;
let timer = 0;
let isAccel = false;
let moveX = 0;
let moveY = 0;
let friction = 16;
let camFriction = 30;
const startOffset = height() * 0.3;
let jumps = 0;
isFullscreen(true);
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
    text("",{
        size: 24,
        font: "apl386", // there're 4 built-in fonts: "apl386", "apl386o", "sink", and "sinko"
    }),
    { value: 0 },
])
let beanPos = vec2(bean.pos.x, bean.pos.y - startOffset)
let maxJumps = 2;
let godmode = false;
onUpdate(() => {
    beanPos = vec2(bean.pos.x, bean.pos.y - startOffset)
    bean.move(moveX * speed, 0);
    camPos(camPos().x + (moveX * camSpeed) * dt(), height() * 0.75 - startOffset);;
    if (isAccel == true) {
        if (speed < maxSpeed){
            speed = speed + acc;         
        }
        if (camSpeed < maxSpeed){
            camSpeed = speed + camAcc;     
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
        bean.flipY(false);
    }
    if (godmode == true){
        debugText.text = "Oh Lord have mercy ._. " + (maxJumps - jumps) + "  " + speed;
    }
    else{
        debugText.text = jumps + "  " + speed;
    }
    debugText.pos = vec2(bean.pos.x, bean.pos.y - 90);
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
onKeyPress("p", () => {
    maxJumps = 1000;
    baseSpeed = 1000;
    camSpeed = 1000;
    maxSpeed = 3000;
    acc = 300;
    camAcc = 1200;
    friction = 100;
    godmode = true;
    camFriction = 180;
});
onKeyPress("w", () => {
    if (bean.isGrounded() || jumps < maxJumps){
        bean.jump(700);  
        jumps++
    }
    if (jumps%2 == 0){
        bean.flipY(true);
    }
    else{
        bean.flipY(false);
    }

});
onKeyPress("f", (c) => {
    fullscreen(!isFullscreen())
})

add ([
    origin("top"),
    rect(50000 ,100),
    pos (width() * 0.5, height() * 0.9),
    area({ width: 50000, height: 100 }),
    solid(),
    color(60,60,60),
    "ground"
])

add ([
    origin("top"),
    rect(200 ,30),
    pos (width() * 0.5 + 500, height() * 0.9 - 185),
    area({ width: 200, height: 30 }),
    solid(),
    color(60,60,60),
    "ground"
])
add ([
    origin("top"),
    rect(300 ,30),
    pos (200 , height() * 0.9 - 420),
    area({ width: 300, height: 30 }),
    solid(),
    color(60,60,60),
    "ground"
])
add ([
    origin("top"),
    rect(100 ,30),
    pos (width() * 0.5, height() * 0.9 - 300),
    area({ width: 100, height: 30 }),
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
});