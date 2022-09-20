import kaboom from "kaboom"
kaboom({
    scale: 1,
    width: 1920,
    height: 1080,
    stretch: true,
    letterbox: true,
    background: [235, 100, 100],
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
            "loop": false
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
            "loop": false
        },
        "slide": {
            "from": 29,
            "to": 30,
            "speed": 10,
            "loop": false
        },
        "roll": {
            "from": 66,
            "to": 69,
            "speed": 10,
            "loop": false
        },
        "dash": {
            "from": 25,
            "to": 26,
            "speed": 10,
            "loop": false
        },
        "slam": {
            "from": 42,
            "to": 47,
            "speed": 10,
            "loop": false
        },
        "slamLand": {
            "from": 51,
            "to": 53,
            "speed": 20,
            "loop": false
        },
        "jump": {
            "from": 54,
            "to": 57,
            "speed": 10,
            "loop": false
        },
        "moveJump": {
            "from": 34,
            "to": 41,
            "speed": 15,
            "loop": false
        },
        "moveFall": {
            "from": 41,
            "to": 41,
            "speed": 10,
            "loop": false
        },
        "hang": {
            "from": 32,
            "to": 33,
            "speed": 10,
            "loop": false
        },
        "airIdle": {
            "from": 54,
            "to": 54,
            "speed": 10,
            "loop": false
        },
        "charge": {
            "from": 60,
            "to": 62,
            "speed": 10,
            "loop": false
        },
        "chargeEnd": {
            "from": 64,
            "to": 65,
            "speed": 10,
            "loop": true
        },
    }
})
scene("start", () => {
    let menuText = add([
        origin("center"),
        text("Press F to start"),
        pos(width() * 0.5, height() * 0.5),
        { value: 0 },
    ])

    onKeyPress("f", (c) => {
        fullscreen(!isFullscreen())
        go("main");
    })
})
go("start");
scene("main", () => {
    let health = 5;
    let baseSpeed = 150;
    let speed = baseSpeed;
    let camSpeed = 0;
    const accBase = 10;
    let acc = accBase;
    const camAccBase = 40;
    let camAcc = camAccBase;
    const maxSpeedBase = 500;
    let maxSpeed = maxSpeedBase;
    let timer = 0;
    let isAccel = false;
    let moveX = 1;
    let moveY = 0;
    let friction = 32;
    let dashCharge = 0.6;
    let dashChargeTimer = dashCharge;
    let camFriction = friction * (camAcc/acc);
    const startOffset = height() * 0.3;
    let jumps = 0;
    let roll = false;
    let run = false;
    let dash = false;
    let charge = false;
    let slam = false;
    let hang = false;
    let godmode = false;
    isFullscreen(true);
    let bean = add([
        origin("bottom"),
        sprite("bean", {
            anim: "idle",
        }),
        body(),
        area({ width: 56, height: 110 }),
        pos(width() * 0.5, height() * 0.75),
        origin('center'),
        scale(0.8),
        rotate(0),
        "bean",
    ])
    class beanaction {
        constructor() {
        }
        run(active) {
            if (active) {
                bean.move(moveX * speed, 0);
                if (speed < maxSpeed) {
                    speed = speed + acc;
                }
                if (camSpeed < maxSpeed) {
                    camSpeed = speed + camAcc;
                }
                if (roll == false && dash == false) {
                    if (speed > maxSpeed) {
                        speed = speed - friction;
                    }
                    if (camSpeed > maxSpeed) {
                        camSpeed = camSpeed - friction; //set to minus friction if over limit to fix issues slowing down when speed over "maxspeed" during dashes.
                    }
                }
            }
        }
        roll(active) {
            if (active) {
                run = false;
                bean.move(moveX * speed, 0);
                speed = 250;
                camSpeed = 400;
                bean.scale.y = 0.5;
            }
            else {
                bean.scale.y = 0.8;
            }
        }
        dash(active) {
            if (active) {
                run = false;
                bean.move(moveX * speed, 0);
                speed = 1700 - (1500 * (dashChargeTimer.toFixed(2) / dashCharge));
                camSpeed = 3400 - (3000 * (dashChargeTimer.toFixed(2) / dashCharge));
            }
        }
        slam(active) {
            if (active) {
                bean.move(0, 500);
                gravity(3200);
            }
        }
        hang(active) {
            if (active) {
                gravity(500);
                jumps = 1;
            }
        }
        /*godmode(active) {
            if (active) {
                debugText.text = "Oh Lord have mercy ._. " + (maxJumps - jumps) + "  " + speed;
                maxJumps = 1000;
                baseSpeed = 1000;
                camSpeed = 1000;
                maxSpeed = 3000;
                acc = 300;
                camAcc = 1200;
                friction = 500;
                camFriction = friction * (camAcc/acc);
            }
            if (!active) {
                maxJumps = 2;
                baseSpeed = 150;
                camSpeed = camSpeedBase;
                maxSpeed = maxSpeedBase;
                acc = accBase;
                camAcc = camAccBase;
                friction = 32;
                camFriction = friction * (camAcc/acc);
            }

        }*/

    };
    let debugText = add([
        origin("center"),
        text("", {
            size: 24,
            font: "apl386", // there're 4 built-in fonts: "apl386", "apl386o", "sink", and "sinko"
        }),
        { value: 0 },
    ])
    let beanPos = vec2(bean.pos.x, bean.pos.y - startOffset)
    let maxJumps = 2;
    let beanAction = new beanaction(false);

    onUpdate(() => {
        console.log(bean.curAnim())
        camFriction = friction * (camAcc/acc);
        hang = false;
        gravity(1600);
        //Create offset player coordinates
        beanPos = vec2(bean.pos.x, bean.pos.y - startOffset)
        //Camera Position Update
        camPos(camPos().x + (moveX * camSpeed) * dt(), height() * 0.75 - startOffset);;
        //Action Functions
        if (run == true) {
            beanAction.run(true);
        }
        else {
            //Slow down until speed is 0
            if (speed > 0) {
                speed = (speed - friction);
                beanAction.run(true);
            }
            else {
                speed = 0;
                isAccel = false
                if (bean.isGrounded())
                    if (bean.isFalling() && bean.isGrounded == false) {
                        bean.play("airIdle");
                    }
                beanAction.run(false);
            }
            if (camSpeed > 0) {
                camSpeed = (camSpeed - camFriction);
            }
            else {
                camSpeed = 0;
                camPos(beanPos.x, camPos().y);
            }
        }
        beanAction.roll(roll);
        beanAction.dash(dash);
        beanAction.slam(slam);
        beanAction.hang(hang);

        //Refresh Animations
        if (bean.curAnim() == null) {
            if (isAccel) {
                if (bean.isGrounded()) {
                    if (run == true) {
                        bean.play("run");
                    }
                    else {
                        bean.play("slide");
                    }
                }
                else {
                    bean.play("moveFall");
                }
            }
            else {
                if (bean.isGrounded()) {
                    bean.play("idle");
                }
                else {
                    bean.play("airIdle");
                }
            }
        }
        //GroundedFunctions
        if (bean.isGrounded()) {
            jumps = 0;
            if (slam == true) {
                bean.stop();
                speed = 0;
                slam = false;
                bean.play("slamLand");
            }
            if (bean.curAnim() == "moveJump") {
                bean.stop();
            }
        }
        //OutofboundsReset
        if (beanPos.y > 7000) {
            console.log("Out Of Bounds");
            bean.pos = vec2(width() * 0.5, height() * 0.75);
            beanPos = vec2(bean.pos.x, bean.pos.y - startOffset);
        }


        debugText.text = jumps + " " + camSpeed + " " + speed + " " + bean.curAnim() + " " + dashChargeTimer.toFixed(2);
        debugText.pos = vec2(bean.pos.x, bean.pos.y - 90);
        readd(debugText);
    })

    onCollide("bean", "wall", (a, b, c) => {
        let d
        if (c == null) {
            d = vec2(0, 0);
        }
        else {
            d = vec2(c.displacement.x, c.displacement.y)
        }
        if (d.y == 0) {
            if (bean.isFalling() && roll == false) { //prevents roll being cancelled by the hang animation resulting in infinite slide and small hitbox
                hang = true;
                if (bean.curAnim() != "hang") {
                    bean.play("hang");
                }
            }
        }
    });
    onCollide("bean", "ground", (a, b, c) => {
        let d
        if (c == null) {
            d = vec2(0, 0);
        } //prevents error
        else {
            d = vec2(c.displacement.x, c.displacement.y)
        }
        if (d.y == 0) { //stop the camera from moving without character by killing all acceleration
            speed = 0;
            acc = 1;
            camAcc = 0;
            camSpeed = 0;
            run = false;
            dashChargeTimer = dashCharge;
            dash = false;
            //cancels dash when connecting with a wall, otherwise wont end and will build up very large force
        }
        
        if (d.x == -0) {
            
        }
        if (d.x == 0) {
            acc = accBase;
            camAcc = camAccBase;
        }
    })
    //Movement Keys
    onKeyDown("a", () => {
        if (roll == false && dash == false) {
            moveX = -1;
            bean.flipX(true);
            isAccel = true;
            if (roll == false && dash == false) {
                run = true;
            }
        }
    });
    onKeyPress("a", () => {
        if (roll == false && dash == false) {
            speed = baseSpeed;
            acc = accBase;
            camAcc = camAccBase;
            if (bean.isGrounded()) {
                bean.play("run");
            }
        }
    });
    onKeyRelease("a", () => {
        if (roll == false && dash == false) {
            run = false;
            if (bean.isGrounded()) {
                bean.play("slide");
            };
        }
    });
    onKeyPress("s", () => {
        if (roll == false) {
            if (!bean.isGrounded() && dashChargeTimer == dashCharge) {
                speed = 0;
                camSpeed = 0;
                slam = true;
                bean.play("slam");
            }
        }
    });
    onKeyDown("d", () => {
        if (roll == false && dash == false) {
            moveX = 1;
            bean.flipX(false);
            isAccel = true;
            if (roll == false && dash == false) {
                run = true;
            }
        }
    });
    onKeyPress("d", () => {
        if (roll == false && dash == false) {
            speed = baseSpeed;
            acc = accBase;
            camAcc = camAccBase;
            isAccel = true
            if (bean.isGrounded()) {
                bean.play("run");
            }
        }
    });
    onKeyRelease("d", () => {
        if (roll == false && dash == false) {
            run = false;
            if (bean.isGrounded()) {
                bean.play("slide");
            }
        }
    });
    onKeyPress("w", () => {
        if (roll == false && dash == false) {
            if (bean.isGrounded() || jumps < maxJumps) {
                bean.jump(700);
                jumps++
                if (isAccel) {
                    bean.play("moveJump");
                }
                else {
                    bean.play("jump");
                }
            }
            if (jumps % 2 == 0) {
                //double jump stuff
            }
            else {
                bean.flipY(false);
            }
        }
    });
    //Ability Keys
    onKeyPress("space", () => {
        if (bean.isGrounded()) {
            roll = true;
            bean.play("roll", {
                onEnd: () => {
                    camSpeed = speed;
                    roll = false;
                    maxSpeed = maxSpeedBase; //max speed would not reset if let got of charge while in roll
                    dash = false;
                    dashChargeTimer = dashCharge;
                }
            });
        }
    });
    onKeyRelease("shift", () => {
        if (roll == false) {
            maxSpeed = maxSpeedBase;
            charge = false;
            dash = true;
            bean.stop()
            bean.play("dash", {
                onEnd: () => {
                    dash = false;
                    dashChargeTimer = dashCharge;
                }
            });
        }
    });
    onKeyPress("shift", () => {
        if (roll == false){ //prevents infinite roll by using charge
            charge = true;
            bean.play("charge", {
                onEnd: () => {
                    charge = false
                    bean.play("chargeEnd")
                }
            });
        }
    });
    onKeyDown("shift", () => {
        if (roll == false) {
            maxSpeed = 150;
            if (dashChargeTimer > 0) {
                dashChargeTimer = dashChargeTimer - dt();
                if (charge == false && bean.curAnim() != "chargeEnd") {
                    bean.play("chargeEnd");
                }
            }
            else {
                dashChargeTimer = 0;
                if (bean.curAnim() != "chargeEnd") {
                    bean.play("chargeEnd");
                }
            }
        }
    });
    //Extra Keys
    onKeyPress("p", () => {
        if (godmode == false) {
            beanAction.godmode(true);
            godmode = true;
        }
        else {
            beanAction.godmode(false);
            godmode = false;
        }
    });
    onKeyPress("f", (c) => {
        fullscreen(!isFullscreen())
    })

    add([
        origin("top"),
        rect(50000, 100),
        pos(width() * 0.5, height() * 0.9),
        area({ width: 50000, height: 100 }),
        solid(),
        color(60, 60, 60),
        "ground"
    ])
    add([
        origin("top"),
        rect(200, 30),
        pos(width() * 0.5 + 500, height() * 0.9 - 185),
        area({ width: 200, height: 30 }),
        solid(),
        color(60, 60, 60),
        "ground"
    ])
    add([
        origin("top"),
        rect(300, 30),
        pos(200, height() * 0.9 - 420),
        area({ width: 300, height: 30 }),
        solid(),
        color(60, 60, 60),
        "ground"
    ])
    add([
        origin("top"),
        rect(100, 30),
        pos(width() * 0.5, height() * 0.9 - 300),
        area({ width: 100, height: 30 }),
        solid(),
        color(60, 60, 60),
        "ground"
    ])
    add([
        origin("top"),
        rect(400, 150),
        pos(width() * 0.5 + 200, height() * 0.9 - 50),
        area({ width: 400, height: 150 }),
        solid(),
        color(60, 60, 60),
        "ground"
    ])
    add([
        origin("top"),
        rect(40, 800),
        pos(width() * 0.5 + 1000, height() * 0.9 - 865),
        area({ width: 40, height: 800 }),
        solid(),
        color(60, 60, 60),
        "ground",
        "wall"
    ])
    add([
        origin("top"),
        rect(40, 800),
        pos(width() * 0.5 + 1300, height() * 0.9 - 865),
        area({ width: 40, height: 800 }),
        solid(),
        color(60, 60, 60),
        "ground",
        "wall"
    ])
});