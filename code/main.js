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
            "loop": true
        },
        "run": {
            "from": 23,
            "to": 28,
            "speed": 10,
            "loop": true
        },
        "slide": {
            "from": 17,
            "to": 18,
            "speed": 10,
            "loop": true
        },
        "roll": {
            "from": 16,
            "to": 20,
            "speed": 10,
            "loop": false
        },
        "dash": {
            "from": 25,
            "to": 28,
            "speed": 10,
            "loop": false
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
let friction = 32;
let camFriction = 128;
const startOffset = height() * 0.3;
let jumps = 0;
let roll = false;
let run = false;
let dash = false;
let slam = false;
let hang = false;
let godmode = false;
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
    "bean",
])   
class beanaction {
    //hang: boolean;
    constructor() {
    }
    run(active) {
        if (active) {
            bean.move(moveX * speed, 0);
            if (speed < maxSpeed){
                speed = speed + acc;         
            }
            if (camSpeed < maxSpeed){
                camSpeed = speed + camAcc;     
            }
            if (roll == false && dash == false){
                if (speed > maxSpeed){
                    speed = maxSpeed;
                }
                if (camSpeed > maxSpeed){
                    camSpeed = maxSpeed;
                }
            }
        }
    }
    roll(active){
        if (active) {
            run = false;
            bean.move(moveX * speed, 0);
            speed = 250;
            camSpeed = 250;
            bean.scale.y = 0.5;
        }
    }
    dash(active){
        if (active) {
            run = false;
            bean.move(moveX * speed, 0);
            speed = 1000;
            camSpeed = 2000;
        }
    }
    slam(active){
        if(active){
            bean.move(0, 2000);    
        }
    }
    hang(active){
        if(active){
            if (bean.isFalling()){
            gravity(100);
            jumps = 1;
            }
        }
    }
    godmode(active){
        if (active){
            debugText.text = "Oh Lord have mercy ._. " + (maxJumps - jumps) + "  " + speed;
            maxJumps = 1000;
            baseSpeed = 1000;
            camSpeed = 1000;
            maxSpeed = 3000;
            acc = 300;
            camAcc = 1200;
            friction = 500;
            camFriction = 2000;
        }
        if (!active){
            maxJumps = 2;
            baseSpeed = 150;
            camSpeed = 150;
            maxSpeed = 500;
            acc = 10;
            camAcc = 40;
            friction = 32;
            camFriction = 128;
        }
        
    }

};
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
let beanAction = new beanaction(false);
    
onUpdate(() => {
    hang = false;
    //Create offset player coordinates
    beanPos = vec2(bean.pos.x, bean.pos.y - startOffset)
    //Camera Position Update
    camPos(camPos().x + (moveX * camSpeed) * dt(), height() * 0.75 - startOffset);; 
    //Acelleration Check
    gravity(1600);
    if (run == true) {
        beanAction.run(true);
    }
    else {
        //Slow down until speed is 0
        if (speed > 0){
            speed = (speed - friction);
            beanAction.run(true);
        }
        else {
            speed = 0;
            isAccel = false
            if (bean.curAnim() == "slide"){
                bean.play("idle"); 
            }
            beanAction.run(false);
        }  
        if (camSpeed > 0){
            camSpeed = (camSpeed - camFriction);
        }
        else {
            camSpeed = 0;
            camPos(beanPos.x,camPos().y);
        }   
    }
    beanAction.roll(roll);
    beanAction.dash(dash);
    beanAction.slam(slam);
    beanAction.hang(hang);
    
    //Refresh Animations
    if (bean.curAnim() == null){
        if(isAccel){
            if(bean.isGrounded()){
                if (run == true){
                    bean.play("run");
                } 
                else{
                    bean.play("slide"); 
                }
            }
            else{
                //moving jump animation
            }
        }
        else {
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
        slam = false;
        bean.flipY(false);
    }
    
    debugText.text = jumps + "  " + speed;
    debugText.pos = vec2(bean.pos.x, bean.pos.y - 90);
    readd(debugText);
})
   
onKeyPress("space", () => {
    if (bean.isGrounded()){
        roll = true;
        //setTimeout(() => {
        //}, "50")
        bean.play("roll", {
            onEnd: () => {
                bean.scale.y = 0.8;
                roll = false
            }
        })
    }
});
onCollide("bean", "ground", (a,b,c) => {
    let d
    if (c == null){
        d = vec2(0,0);
    }
    else{
        d = vec2(c.displacement.x, c.displacement.y)
    }
    if(d.y == 0){
       speed = 0;    
       camSpeed = 0; 
       run = false;
       hang = true;
       dash = false;
       roll = false;
    }
    if(d.x == -0){ 
       bean.jumpForce = -640;
    }
    if(d.x == 0){ 
       bean.jumpForce = 640;
    }
})
onKeyDown("a", () => {
    if (roll == false){
    moveX = -1;
    bean.flipX(true);
    isAccel = true;
    if (roll == false && dash == false){
      run = true;  
    } 
    }
});
onKeyPress("a", () => {
    if (roll == false){
    speed = baseSpeed;
    bean.play("run");
    }
});
onKeyRelease("a", () => {
    if (roll == false){
    run = false;
    bean.play("slide"); 
    }
});
onKeyPress("s", () => {
    if (roll == false){
    if (!bean.isGrounded()){
        speed = 0;
        camSpeed = 0;
        setTimeout(() => {
            slam = true;
        }, "100")   
    }
    }
});
onKeyDown("d", () => {
    if (roll == false){
    moveX = 1;    
    bean.flipX(false);
    isAccel = true;
    if (roll == false && dash == false){
      run = true;  
    } 
    }
});
onKeyPress("d", () => {
    if (roll == false){
    speed = baseSpeed;
    isAccel = true
    bean.play("run");
    }
});
onKeyRelease("d", () => {
    if (roll == false){
    run = false;
    bean.play("slide"); 
    }
});
onKeyPress("shift", () => {
    if (roll == false){
    dash = true;
    setTimeout(() => {
        dash = false;
    }, "200")
    bean.stop()
    bean.play("dash");
    }
});
onKeyPress("p", () => {
    if (godmode == false){
        beanAction.godmode(true);
        godmode = true;
    }
    else{
        beanAction.godmode(false);
        godmode = false;
    }  
});
onKeyPress("w", () => {
    if (roll == false){
    if (bean.isGrounded() || jumps < maxJumps){
        bean.jump(700);  
        jumps++
    }
    if (jumps%2 == 0){
        //double jump anim
    }
    else{
        bean.flipY(false);
    }
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
let wall1 = add ([
    origin("top"),
    rect(200 ,400),
    pos (width() * 0.5 + 1000, height() * 0.9 - 465),
    area({ width: 200, height: 400 }),
    solid(),
    color(60,60,60),
    "ground"
])
});