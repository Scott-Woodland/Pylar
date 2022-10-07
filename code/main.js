import kaboom from "kaboom"
window.onload = function() {
    window.document.body.onkeydown = function() {
        if (event.ctrlKey) {
            event.stopPropagation();
            event.preventDefault();
            try {
                event.keyCode = 0;
            }
            catch (event) {
            }
            return false;
        }
        return true;
    }
}
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
        "punch1": {
            "from": 16,
            "to": 18,
            "speed": 10,
            "loop": false
        },
        "punch2": {
            "from": 19,
            "to": 22,
            "speed": 10,
            "loop": false
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
        "uppercut": {
            "from": 32,
            "to": 33,
            "speed": 10,
            "loop": false
        },
        "kick": {
            "from": 52,
            "to": 53,
            "speed": 10,
            "loop": false
        },
    }
})
loadSprite("knife", "sprites/Shurkurhainkin.png", {
    "width": 384,
    "height": 128,
    "sliceX": 3,
    "sliceY": 1,
    "anims": {
        "static": {
            "from": 0,
            "to": 0,
            "loop": false
        },
        "thrown": {
            "from": 1,
            "to": 2,
            "loop": true,
            "speed": 20
        }
    }
})
loadSprite("KIcon", "sprites/Shuricon.png")
scene("start", () => {
    let menuText = add([
        origin("center"),
        text("Some inputs only work in fullscreen - Press F",{ width: 1500}),
        pos(width() * 0.5, height() * 0.5),
        { value: 0 },
    ])

    onKeyPress("f", (c) => {
        fullscreen(true);
        go("main");
    })
})
go("start");

scene("main", () => {
    isFullscreen(true);
    class Timer {
    constructor(time, active) {
        this.base = time;
        this.time = time;
        this.active = active;           
    }
    update() {
        if (this.active) {
            this.time = this.time - dt();    
        }
        if (this.time < 0){
            this.active = false;
            this.time = this.base;
        }
    }      
}
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
    let dashCharge = 0.26;
    let dashChargeTimer = dashCharge;
    let camFriction = friction * (camAcc / acc);
    const startOffset = height() * 0.3;
    let jumps = 0;
    let roll = false;
    let run = false;
    let dash = false;
    let charge = false;
    let slam = false;
    let hang = false;
    let kick = false;
    let isPunching = false;
    let thrown = false;
    let landed = true;
    let throwX = 1;
    let ammo = 1;
    let kTime = 0;
    let knifeSpeed = 1500;
    let punchCount = 0;
    let punchDmg = 20;
    let slamDmg = 30;
    let chargeDmg = 50;
    let godmode = false;
    let currentEnemy = add([
        pos(0,0),
        area({width: 1, height: 1}),
        fixed(),
    ])
    let index = "1";
    let rollUI = add([
        z(10),
        origin("center"),
        rect(75,5),
        pos(width() * 0.5, height() * 0.97),
        fixed(),
        color(255, 255, 255),
    ])
    let dashUI = add([
        z(10),
        origin("center"),
        rect(450,5),
        pos(width() * 0.5, height() * 0.96),
        fixed(),
        color(113, 223, 240),
    ])
    let slamUI = add([
        z(10),
        origin("bot"),
        rect(60,20),
        pos(width() * 0.5, height() - 2),
        fixed(),
        color(255, 255, 255),
    ])
    let healthUI = add([
        z(10),
        origin("left"),
        text("HEALTH: 3", {
            size: 30,
            font: "apl386", // there're 4 built-in fonts: "apl386", "apl386o", "sink", and "sinko"
        }),
        pos((width() * 0.5) - 225, height() * 0.985),
        fixed(),
        color(255, 255, 255),
    ])
    let debugText = add([
        origin("center"),
        text("", {
            size: 24,
            font: "apl386", // there're 4 built-in fonts: "apl386", "apl386o", "sink", and "sinko"
        }),
        { value: 0 },
    ])
    let returnKUI = add([
        z(10),
        origin("left"),
        rect(75,5),
        pos(width() * 0.5, height() * 0.9),
        color(255, 255, 255),
    ])
    let ammoUI = add([
        scale(0.65),
        z(10),
        origin("center"),
        sprite("KIcon"),
        pos(width() - 60, height() - 50),
        fixed()
    ])
    add([
        z(9),
        origin("bot"),
        rect(1000,60),
        pos(width() * 0.5, height()),
        color(70,70,70),
        fixed()
    ])
    add([
        z(9),
        origin("bot"),
        circle(60),
        pos(width() * 0.5 - 500, height()),
        color(70,70,70),
        fixed()
    ])
    add([
        z(9),
        origin("bot"),
        circle(60),
        pos(width() * 0.5 + 500, height()),
        color(70,70,70),
        fixed()
    ])
    add([
        z(9),
        origin("center"),
        circle(66),
        pos(width() - 60, height() - 40),
        color(70,70,70),
        fixed()
    ])
    add([
        z(9),
        origin("botright"),
        rect(60,106),
        pos(width(),height()),
        color(70,70,70),
        fixed()
    ])
    add([
        z(9),
        origin("botright"),
        rect(126, 40),
        pos(width(),height()),
        color(70,70,70),
        fixed()
    ])
     
    class enemy {
        constructor(index, position, scale, attackDmg,health,speed,aggression) { 
        this.attackDmg = attackDmg;
        this.health = health;
        this.speed = speed;
        this.position = position;
        this.scale = scale;
        this.aggression = aggression;
        this.index = index;
        this.body;
        this.enemy;
        this.attackBox;
        this.healthbar;
        this.timer = new Timer(0.25, false);
        }
        initialise(){
            this.body = add([
            z(5),
            origin("bot"),
            pos(this.position),
            body(),
            scale(this.scale),
            area({width: 70, height: 1}),
            "ground",
            this.index
            ])
            this.enemy = add([
            z(5),
            health(this.health),
            follow(this.body),
            origin("bot"),
            pos(this.position),
            scale(this.scale),
            color(200,200,200),
            rect(70,70),
            area({width: 70, height: 70}),
            "enemy",
            this.index
            ])
            this.attackBox = add([
            z(5),
            follow(this.body),
            origin("bot"),
            pos(this.position),
            scale(this.scale),
            area({width: 150, height: 110}),
            "enemyAttackBox",
            this.index
        ])
            this.healthBar = add([
                z(4),
                origin("left"),
                rect(120*this.scale,5),
                pos(0,0),
                color(255, 10, 10),
                this.index
            ])
        }      
        update(){
            this.healthBar.pos = vec2(this.body.pos.x - (60 * this.scale) ,this.body.pos.y - (80 * this.scale))
            this.healthBar.width = 120 * this.scale * (this.enemy.hp()/this.health)
            this.timer.update();
            
            if (playerDamageBox.isColliding(this.enemy)){
                if (isPunching == true && this.timer.active == false){
                    this.timer.active = true;
                    damage(this.enemy, punchDmg);
                    console.log(this.enemy.hp())
                }
                if(this.enemy.hp() == 0){
                    destroyAll(this.index);
                }
            }
            
                
        }
    }
    let enemy1 = new enemy("1", vec2(200,20), 1.2, 1, 100, 5 ,"def")
    let enemy2 = new enemy("2", vec2(700,20), 1, 1, 100, 5 ,"def")
    let enemy3 = new enemy("3", vec2(1000,20), 0.9, 1, 100, 5 ,"def")
    let enemy4 = new enemy("4", vec2(-100,20), 0.7, 1, 100, 5 ,"def")
    let enemy5 = new enemy("5", vec2(1700,20), 2, 1, 100, 5 ,"def")
    
    enemy1.initialise();
    enemy2.initialise();
    enemy3.initialise();
    enemy4.initialise();
    enemy5.initialise();

    let bean = add([
        z(6),
        origin("bottom"),
        sprite("bean", {
            anim: "idle",
        }),
        body(),
        health(3),
        area({ width: 56, height: 110 }),
        pos(width() * 0.5, height() * 0.75),
        origin('center'),
        scale(0.8),
        rotate(0),
        "bean",
    ])
    let playerDamageBox = add([
        origin("center"),
        area({ width: 75, height: 65 }),
        pos(width() * 0.5, height() * 0.75),
        "melee",
    ])
    let playerSlamBox = add([
        origin("bot"),
        area({ width: 250, height: 40 }),
        pos(width() * 0.5, height() * 0.75),
        "slam",
    ])
    let playerKickBox = add([
        origin("bot"),
        area({ width: 100, height: 40 }),
        pos(width() * 0.5, height() * 0.75),
        "kick",
    ])
    let knife = add([
        z(4),
        sprite("knife", {
            anim: "static",
        }),
        origin("center"),
        area({ width: 120, height: 120 }),
        pos(width() * 0.5, height() * 0.75),
        "knife",
    ])
    
    let rollTimer = new Timer(0.5,false);
    let dashTimer = new Timer(3,false);
    let slamTimer = new Timer(2,false);
    let inv = new Timer(1.5, false);
    let returnK = new Timer(2, false);
    let enInv = new Timer(0.2,false);
    
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
                if (roll == false && dash == false && kick == false){
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
                shake(0.5);
                jumps = 1;
            }
        }
        kick(active) {
            if (active){
                run = false;
                bean.move(moveX * speed, 0);
                bean.scale.y = 0.5;
            }
            else{
                bean.scale.y = 0.8;
            }
            
        }
        throw(active) {
            if (active){
                kTime = kTime + dt();
                let x = (Math.cos(throwAngle) * knifeSpeed - (throwX * Math.pow(kTime, 5) * 500));
                if (x * throwX < 0){
                    x = 0; //no boomarang pls
                }
                knife.move(x, (Math.sin(throwAngle) * knifeSpeed) + 160 * 9.8 * kTime * kTime);
                
            }
            else {
                kTime = 0;
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
 
    let beanPos = vec2(bean.pos.x, bean.pos.y - startOffset)
    let maxJumps = 2;
    let beanAction = new beanaction(false);

    function damage(target, damage){
        if (inv.active == false && roll == false){
          target.hurt(damage);  
        }
    };
    function returnKnife(){
        ammoUI.color = rgb(255,255,255);
        returnK.time = 2;
        knife.scale = 0.25;
        landed = false;
        if (ammo == 0){
           ammo++ 
        } 
    }
    function getIndex(b){
        index = "1";
        currentEnemy = b;
        while (b.is(index) == false){
            index = (parseInt(index) + 1).toString();
        }
    }
    
    bean.onDeath(() => {
        add([
        z(10),
        origin("center"),
        text("YOU DIED :(", {
            size: 100,
            font: "apl386",
        }),
        pos((width() * 0.5), height() * 0.5),
        fixed(),
        color(255, 255, 255)
        ]);
        shake(50);
        destroy(bean);
        setTimeout(() => { go("start")}, 2000);
        
    });
    bean.onHurt(() =>{
        inv.active = true;
        shake(10);
        healthUI.color = rgb(255,0,0);
    });
    onUpdate(() => {
        //world update
        aim = toWorld(mousePos())
        rollTimer.update();
        dashTimer.update();
        slamTimer.update();
        returnK.update();
        inv.update();
        enInv.update();
        enemy1.update();
        enemy2.update();
        enemy3.update();
        enemy4.update();
        enemy5.update();
        
        camFriction = friction * (camAcc / acc);
        hang = false;
        gravity(1600);

        if (bean.curAnim() != "punch1" || bean.curAnim() != "punch2"){
            isPunching = false;
        }
        //Create offset player coordinates
        beanPos = vec2(bean.pos.x, bean.pos.y - startOffset);
        
        //Camera Position Update
        camPos(camPos().x + (moveX * camSpeed) * dt(), bean.pos.y/4 + 300); //height() * 0.75 - startOffset);
        
        //Hitbox Position Update
        playerDamageBox.pos = vec2(bean.pos.x + (50 * moveX), bean.pos.y);
        playerSlamBox.pos = vec2(bean.pos.x, bean.pos.y + 55);
        playerKickBox.pos = vec2(bean.pos.x + (40 * moveX), bean.pos.y + 50);
        if(ammo == 1){knife.pos = vec2(bean.pos.x , bean.pos.y)};
        
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
        beanAction.hang(kick);
        beanAction.throw(thrown);

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
                slamTimer.active = true;
                shake(8);
            }
            if (bean.curAnim() == "moveJump" || bean.curAnim() == "uppercut") {
                bean.stop();
            }
        }
        //OutofboundsReset
        if (beanPos.y > 7000) {
            console.log("Out Of Bounds");
            bean.pos = vec2(width() * 0.5, height() * 0.75);
            beanPos = vec2(bean.pos.x, bean.pos.y - startOffset);
        }
        
        //UI Update 
        //console.log(bean.curAnim())
        rollUI.width = 75 * rollTimer.time/0.5;
        
        if (dashTimer.active == true){
               dashUI.width = 450 * ((3 - dashTimer.time)/3);
               dashUI.color = rgb(240, 197, 5);
        }
        else if (bean.curAnim() == "charge" || bean.curAnim() == "chargeEnd"){
            dashUI.width = (430 * dashChargeTimer/dashCharge) + 20;
            dashUI.color = rgb(245, 20, 20);
        }
        else{
            dashUI.width = 450;
            dashUI.color = rgb(3, 222, 255);  
        }
        
        if (slamTimer.active == true){
           slamUI.height = 20 * ((2 - slamTimer.time)/2); 
           slamUI.color = rgb(255, 89, 43);
        }
        else{
            slamUI.height = 20;
            slamUI.color = rgb(255, 255, 255);
        }
        if (inv.active == false){
            healthUI.color = rgb(255,255,255);
        }
        if (returnK.active == true && landed == true){
           returnKUI.width = 75 * (returnK.time/2); 
        }
        else {
            returnKUI.width = 0;
        }
        debugText.text = bean.curAnim();//bean.curAnim();
        debugText.pos = vec2(bean.pos.x, bean.pos.y - 90);
        returnKUI.pos = vec2(bean.pos.x - 37.5, bean.pos.y - 70);
        healthUI.text = "HEALTH: " + bean.hp(); 
        readd(debugText);
        readd(healthUI);
    })

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
            if (dash == true) {
                dashChargeTimer = dashCharge;
                dash = false;
                shake(8);
            }

            //cancels dash when connecting with a wall, otherwise wont end and will build up very large force
        }

        if (d.x == -0) {

        }
        if (d.x == 0) {
            acc = accBase;
            camAcc = camAccBase;
        }
    });
    onCollide("bean", "wall", (a, b, c) => {
        let d
        if (c == null) {
            d = vec2(0, 0);
        }
        else {
            d = vec2(c.displacement.x, c.displacement.y)
        }
        if (d.y == 0) {
            if (bean.isFalling() && roll == false && kick == false) { //prevents roll being cancelled by the hang animation resulting in infinite slide and small hitbox
                hang = true;
                if (bean.curAnim() != "hang") {
                    bean.play("hang");
                }
            }
        }
    });
    onCollide("bean", "dmg", (a, b, c) => {
        damage(bean, 1);
    });
    onCollide("knife", "ground", (a, b, c) => {
        knife.stop();
        knife.play("static");
        //knife.scale = 0.75;
        thrown = false;
        landed = true;
        shake(2);
    });
    onCollide("knife", "bean", (a, b, c) => {
        returnKnife(); 
    });
    
    onCollide("melee", "enemy", (a, b, c) => {
        getIndex(b);
    });
    //combat keys
    onMousePress("left", () => {
        if (roll == false && dash == false && kick == false) {
            if(isKeyDown("control") && bean.isGrounded()){
                kick = true;
                bean.play("kick", {
                    onEnd: () => {
                        kick = false;
                        dash = false;
                        dashChargeTimer = dashCharge;
                    }
                }) 
            }
            else if (bean.curAnim() != "punch1" && bean.curAnim() != "punch2"){
                isPunching = true;
                if (punchCount == 0){
                    bean.play("punch1", {
                        onEnd: () => {
                            isPunching = false;
                            dash = false;
                            dashChargeTimer = dashCharge;
                        }
                    })
                    punchCount++
                }   
                else if (punchCount == 1){
                    bean.play("punch2", {
                        onEnd: () => {
                            isPunching = false;
                            dash = false;
                            dashChargeTimer = dashCharge;
                        }
                    }) 
                    punchCount = 0;
                }  
            }
        }
    });
    onMousePress("right", () => {
        if (roll == false && dash == false && kick == false && ammo > 0) {
            ammoUI.color = rgb(30,30,30);
            thrown = true;
            ammo--;
            knife.play("thrown");
            throwAngle = Math.atan2((aim.y - knife.pos.y),(aim.x - knife.pos.x)); //* 180 / Math.PI;
            if(aim.x - knife.pos.x < 0){throwX = -1}
            else{throwX = 1}
        }
        if (landed == true){returnK.active = true};
    });
    onMouseDown("right", () => {
        if (landed == true && returnK.time < 0.1){
            returnKnife();
        }         
    });
    onMouseRelease("right", () => {
        returnK.active = false;
        returnK.time = 2;
    });
    //Movement Keys
    onKeyDown("a", () => {
        if (roll == false && dash == false && kick == false) {
            moveX = -1;
            bean.flipX(true);
            isAccel = true;
            if (roll == false && dash == false && kick == false) {
                run = true;
            }
        }
    });
    onKeyPress("a", () => {
        if (roll == false && dash == false && kick == false) {
            speed = baseSpeed;
            acc = accBase;
            camAcc = camAccBase;
            if (bean.isGrounded()) {
                bean.play("run");
            }
        }
    });
    onKeyRelease("a", () => {
        if (roll == false && dash == false && kick == false) {
            run = false;
            if (bean.isGrounded()) {
                bean.play("slide");
            }
        }
    });
    
    onKeyPress("s", () => {
        if (roll == false && kick == false && slamTimer.active == false ) {
            if (!bean.isGrounded() && dashChargeTimer == dashCharge) {
                speed = 0;
                camSpeed = 0;
                slam = true;
                bean.play("slam")
            }
        }
    });
    
    onKeyDown("d", () => {
        if (roll == false && dash == false && kick == false) {
            moveX = 1;
            bean.flipX(false);
            isAccel = true;
            if (roll == false && dash == false && kick == false) {
                run = true;
            }
        }
    });
    onKeyPress("d", () => {
        if (roll == false && dash == false && kick == false) {
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
        if (roll == false && dash == false && kick == false) {
            run = false;
            if (bean.isGrounded()) {
                bean.play("slide");
            }
        }
    });
    
    onKeyPress("w", () => {
        if (roll == false && dash == false && kick == false) {
            if (bean.isGrounded() || jumps < maxJumps) {
                let jumpForce = 700;
                if (isKeyDown("control")){
                    if (jumps == 0){
                        jumpForce = 900;
                    }
                    bean.play("uppercut")
                    jumps = jumps + 2;
                }
                else if (isAccel) {
                    bean.play("moveJump");
                    jumps++
                }
                else {
                    bean.play("jump");
                    jumps++
                }
                bean.jump(jumpForce);
            }
            if (jumps % 2 == 0) {
                //double jump stuff
            }
        }
    });
    //Ability Keys
    onKeyPress("space", () => {
        if (bean.isGrounded() && rollTimer.active == false) {
            roll = true;
            rollTimer.active = true;
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
        if (roll == false && kick == false && dashTimer.active == false) {
            maxSpeed = maxSpeedBase;
            charge = false;
            dashTimer.active = true;
            dash = true;
            bean.stop()
            bean.play("dash", {
                onEnd: () => {
                    dash = false;
                    dashChargeTimer = dashCharge;
                    speed = speed - 500;
                    camSpeed = speed - 500;
                }
            });
        }
    });
    onKeyPress("shift", () => {
        if (roll == false && kick == false && dashTimer.active == false) { //prevents infinite roll by using charge
            charge = true;
            bean.play("charge", {
                onEnd: () => {
                    bean.play("chargeEnd")
                    charge = false;
                }
            });
        }
    });
    onKeyDown("shift", () => {
        if (roll == false && kick == false && dashTimer.active == false) {            
            maxSpeed = 150;
            if (dashChargeTimer == dashCharge && bean.curAnim() != "charge"){
                charge = true;
                bean.play("charge", {
                        onEnd: () => {
                        charge = false;
                        dashChargeTimer = dashChargeTimer - dt();
                    }
                });
            }
            else if (dashChargeTimer > 0) {
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
    });

    add([
        origin("top"),
        rect(50000, 300),
        pos(width() * 0.5, height() * 0.9),
        area({ width: 50000, height: 300 }),
        solid(),
        color(60, 60, 60),
        "ground"
    ]) //ground
    //Obsticles
    add([
        origin("top"),
        rect(200, 30),
        pos(width() * 0.5 + 500, height() * 0.9 - 185),
        area({ width: 200, height: 30 }),
        solid(),
        color(60, 60, 60),
        "ground"
    ])
    //platforms
    add([
        origin("top"),
        rect(200, 30),
        pos(width() * 0.5 + 200, height() * 0.9 - 185),
        area({ width: 200, height: 30 }),
        solid(),
        color(200, 60, 60),
        "ground",
        "dmg"
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
    //walls
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