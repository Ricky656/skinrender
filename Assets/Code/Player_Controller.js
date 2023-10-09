#pragma strict

//Direction Facing Sprites
public var spriteFront:Sprite;
public var spriteFrontLeft:Sprite;
public var spriteFrontRight:Sprite;
public var spriteBack:Sprite;
public var spriteBackLeft:Sprite;
public var spriteBackRight:Sprite;
public var spriteRight:Sprite;
public var spriteLeft:Sprite;

public var humanSpriteFront:Sprite;
public var humanSpriteFrontLeft:Sprite;
public var humanSpriteFrontRight:Sprite;
public var humanSpriteBack:Sprite;
public var humanSpriteBackLeft:Sprite;
public var humanSpriteBackRight:Sprite;
public var humanSpriteRight:Sprite;
public var humanSpriteLeft:Sprite;

public var guardSpriteFront:Sprite;
public var guardSpriteFrontLeft:Sprite;
public var guardSpriteFrontRight:Sprite;
public var guardSpriteBack:Sprite;
public var guardSpriteBackLeft:Sprite;
public var guardSpriteBackRight:Sprite;
public var guardSpriteLeft:Sprite;
public var guardSpriteRight:Sprite;

public var bartenderSpriteFront:Sprite;
public var bartenderSpriteFrontLeft:Sprite;
public var bartenderSpriteFrontRight:Sprite;
public var bartenderSpriteBack:Sprite;
public var bartenderSpriteBackLeft:Sprite;
public var bartenderSpriteBackRight:Sprite;
public var bartenderSpriteLeft:Sprite;
public var bartenderSpriteRight:Sprite;
//-----------------------------
//Statistics
public var fSpeed:float;
private var xPos:float;
private var yPos:float;
private var dX:float;
private var dY:float;
private var bHidden:boolean;
public var bDisguised:boolean;
private var bWalking:boolean;

public var bDead:boolean;
public var waypointID:int;
public var bMovementEnabled:boolean;
public var bMovementLocked:boolean;

public var currentSpriteSet:String;

public var inventory:Array;

public var bHasAbilityBartender:boolean;
public var bHasAbilitySeduce:boolean;
public var bHasAbilityGuardShout:boolean;

public var currentState:int;

public var bKilling:boolean;

private var bkilledFirst:boolean;
//-----------------------------
//Float Sprites----------------
public var bartenderIconSprite:Sprite;
public var shoutIconSprite:Sprite;

//-----------------------------
//Input Variables
private var bUp:boolean;
private var bDown:boolean;
private var bLeft:boolean;
private var bRight:boolean;
//-----------------------------
private var iVisibleTimer:int;
private var iDisguiseTimer:float;
private var defaultColour:Color;
private var fBloodTimeLeft:float;
//Data//-----------------------
//Children
public var collisionBall:GameObject;
public var abilityIcon:GameObject;
//-----------------------------
//References
private var enemyList:Array;
private var UIReference:UI_Controller;
//-----------------------------

function Start () {//Sets up initial variables
    UIReference = GameObject.Find("Main Camera").transform.Find("UIController").GetComponent(UI_Controller);
	bMovementEnabled = true;
	inventory = new Array();
	enemyList = new Array();
	var startPosition:Vector2 = IsoToCart(Vector2(transform.position.x,transform.position.y));
	xPos = startPosition.x;
	yPos = startPosition.y;
	fSpeed = 0.8f;// * Time.deltaTime; 
	defaultColour = gameObject.GetComponent(SpriteRenderer).color;

	currentState = GameState.Playing;
	currentSpriteSet = "Human";
	bkilledFirst =false;
	//waypointPosition = Vector2(-1.242,-0.359);
}

function Update () {
    if(currentState == GameState.Playing){
        CheckKeys();//Checks player input
        if(bMovementEnabled == true && bMovementLocked == false && bKilling == false){
            HandleMovement();//If movement is currently allowed, move the player character based on input
        }
	
        CheckVisible(); //Checks to see if the player is currently considered visible
	
        if(bDisguised==true){//Checks the skin disguise timer
            //iDisguiseTimer--;
            if(Time.time>=iDisguiseTimer){
                UnDisguise();
            }
        }

        //Updates ability icon based on abilities the player currently has access to
        if(bHasAbilityBartender){
            abilityIcon.GetComponent(SpriteRenderer).sprite = bartenderIconSprite;
            abilityIcon.GetComponent(SpriteRenderer).enabled = true;
        }else if(bHasAbilityGuardShout){
            abilityIcon.GetComponent(SpriteRenderer).sprite = shoutIconSprite;
            abilityIcon.GetComponent(SpriteRenderer).enabled = true;
        }else{
            abilityIcon.GetComponent(SpriteRenderer).enabled = false;
        }
    }
}

public function Pause(){ //Pause character and disguise timer
    fBloodTimeLeft = iDisguiseTimer - Time.time;
    currentState = GameState.Paused;
}

public function UnPause(){ //Unpause character and calculate correct time left on disguise timer
    iDisguiseTimer = Time.time + fBloodTimeLeft;
    currentState = GameState.Playing;
}

function CheckVisible(){ //Checks if the collision ball currently considers itself visible, and then causes character death of appropriate.
	if(collisionBall.GetComponent(CollisionBallHandler).iVisible>0 && bDisguised == false){
		iVisibleTimer++;
		if(iVisibleTimer>=1){
			Death();
		}
	}else{
		iVisibleTimer=0;
	}
}


//These functions are called when the player kills an enemy and now acquires a skin and possibly an ability-------------
function KilledGuard(){
    yield WaitForSeconds(0.5);
    bKilling = false;
	currentSpriteSet = "Guard";
	Disguise("guard");
	if(bkilledFirst==false){
	    bkilledFirst = true;
	    GameObject.Find("GameController").GetComponent(GameController).DisplayUIMessage("They steal my Skin? I shall wear their flesh as my disguise!");
	}
	//bHasAbilityGuardShout=true;
	//UIReference.ShowMessage("Press F to call someone over to you!");
}

function KilledShouter(){
    yield WaitForSeconds(0.5);
    bKilling = false;
    currentSpriteSet = "Guard";
    Disguise("guard");
    bHasAbilityGuardShout=true;
    UIReference.ShowMessage("Press F to call someone over to you!");
}

function KilledBartender(){
    yield WaitForSeconds(0.5);
    bKilling=false;
    currentSpriteSet = "Bartender";
    Disguise("bartender");
    bHasAbilityBartender = true;
    UIReference.ShowMessage("Walk up to someone and press F to spike their drink, knocking them out after a delay!");
}

function KilledSeduce(){
    yield WaitForSeconds(5);
    bKilling=false;
    currentSpriteSet = "Seduce";
    Disguise("seduce");
    bHasAbilitySeduce = true;
    UIReference.ShowMessage("Walk up to someone looking for love and press F to charm them!");
}

function KilledInnocent(){ //There were plans for killing an innocent to still disguise the player, but cause certain reprecussions. In the service of time, this was cut to just not allow the player to kill innocents.
    Death();
}
//------------------------------------------------------------------------------------------------------------

function Disguise(disguise:String){//Set character to disguised
	//Put on New Sprite
    ChangeSprite("Front");
    UIReference.Visibility(false);
    UIReference.StartBloodTimer(disguise);
	//----
	bDisguised = true;
	iDisguiseTimer = Time.time+10;
	transform.Find("CollisionBall").GetComponent(CollisionBallHandler).iDisguised=1;
}

function UnDisguise(){//Removes disguise from character
    currentSpriteSet = "Skinrender";
    bDisguised = false;
    bHasAbilityBartender=false;
    bHasAbilitySeduce = false;
    bHasAbilityGuardShout = false;
    transform.Find("CollisionBall").GetComponent(CollisionBallHandler).iDisguised=0;

    ChangeSprite("Front");
    UIReference.Visibility(true);
}

function GetItems(itemList:String[]){ //This was part of an old Inventory system that is not being used in the current build. 
	if(itemList !=null){
	    if(itemList.length>0){
	        Debug.Log("got item");
			inventory = inventory.Concat(itemList);
		}
	}
}

function Death(){ //Resets puzzles and player character position/variables to represent a death and restart. 
        bKilling = false;
/*	transform.position = waypointPosition;
	transform.position.y +=0.15;
	var startPosition:Vector2 = IsoToCart(Vector2(transform.position.x,transform.position.y));
	xPos = startPosition.x;
	yPos = startPosition.y;*/
	
	transform.position = GameObject.Find("GameController").GetComponent(GameController).ResetAllPuzzles(waypointID);
	
	//transform.position.y +=0.15;
	var startPosition:Vector2 = IsoToCart(Vector2(transform.position.x,transform.position.y));
	xPos = startPosition.x;
	yPos = startPosition.y;
	
	collisionBall.GetComponent(CollisionBallHandler).Reset();
}

public function ChangePosition(newPosition:Vector2){ //Teleport the character somewhere. The transform itself cannot just be changed as the Isometric position must also be updated, otherwise the character would snap back
    //to previous position after movement took place.
    transform.position = newPosition;
    var movedPosition:Vector2 = IsoToCart(newPosition);
    xPos = movedPosition.x;
    yPos = movedPosition.y;
}

function SetWaypoint(puzzle:int){//Sets current checkpoint
	waypointID = puzzle;
	GameObject.Find("GameController").GetComponent(GameController).SetWaypoint(puzzle);
	transform.position.z = -0.5;
}

function HandleMovement(){ //Moves the character

    //This movement section causes the character to move actually up on the screen when the UP arrow is pressed, this was replaced after playtesting to cause the player to move in 
    //the "North" direction, following the tiles, when the UP arrow is pressed.

	/*if(bUp==false&&bDown==false&&bRight==false&&bLeft==false){
		dX = 0;
		dY= 0;
	}
	else if(bUp==true&&bDown==false&&bRight==false&&bLeft==false){
		gameObject.GetComponent(SpriteRenderer).sprite = spriteBack;
		dX = 0.5f;
		dY= 0.5f;
	}
	else if(bUp==false&&bDown==true&&bRight==false&&bLeft==false){
		gameObject.GetComponent(SpriteRenderer).sprite = spriteFront;
		dX = -0.5f;
		dY= -0.5f;
	}
	else if(bUp==false&&bDown==false&&bRight==true&&bLeft==false){
		gameObject.GetComponent(SpriteRenderer).sprite = spriteRight;
		dX = 0.25f;
		dY= -0.25f;
	}
	else if(bUp==false&&bDown==false&&bRight==false&&bLeft==true){
		gameObject.GetComponent(SpriteRenderer).sprite = spriteLeft;
		dX = -0.25f;
		dY=  0.25f;
	}
	else if(bUp==true&&bDown==false&&bRight==true&&bLeft==false){
		gameObject.GetComponent(SpriteRenderer).sprite = spriteBackRight;
		dX = 0.5f;
		dY =  0;
	}
	else if(bUp==true&&bDown==false&&bRight==false&&bLeft==true){
		gameObject.GetComponent(SpriteRenderer).sprite = spriteBackLeft;
		dX = 0;
		dY = 0.5f;
	}
	else if(bUp==false&&bDown==true&&bRight==false&&bLeft==true){
		gameObject.GetComponent(SpriteRenderer).sprite = spriteFrontRight;
		dX = -0.5f;
		dY = 0;
	}
	else if(bUp==false&&bDown==true&&bRight==true&&bLeft==false){
		gameObject.GetComponent(SpriteRenderer).sprite = spriteFrontLeft;
		dX = 0;
		dY = -0.5f;
	}*/

    //Establishes the proper movement amount for the Isometric game based on arrows currently being pressed
	if(bUp==false&&bDown==false&&bRight==false&&bLeft==false){
		dX = 0;
		dY= 0;
		bWalking =false;
	}
	else if(bUp==true&&bDown==false&&bRight==false&&bLeft==true){
	    bWalking = true;
		//gameObject.GetComponent(SpriteRenderer).sprite = spriteBack;
		ChangeSprite("Back");
		dX = 0.5f;
		dY= 0.5f;
	}
	else if(bUp==false&&bDown==true&&bRight==true&&bLeft==false){
	    bWalking = true;
		//gameObject.GetComponent(SpriteRenderer).sprite = spriteFront;
		ChangeSprite("Front");
		dX = -0.5f;
		dY= -0.5f;
	}
	else if(bUp==true&&bDown==false&&bRight==true&&bLeft==false){
	    bWalking = true;
		//gameObject.GetComponent(SpriteRenderer).sprite = spriteRight;
		ChangeSprite("Right");
		dX = 0.25f;
		dY= -0.25f;
	}
	else if(bUp==false&&bDown==true&&bRight==false&&bLeft==true){
	    bWalking = true;
		//gameObject.GetComponent(SpriteRenderer).sprite = spriteLeft;
		ChangeSprite("Left");
		dX = -0.25f;
		dY=  0.25f;
	}
	else if(bUp==true&&bDown==false&&bRight==false&&bLeft==false){
	    bWalking = true;
		//gameObject.GetComponent(SpriteRenderer).sprite = spriteBackRight;
		ChangeSprite("BackRight");
		dX = 0.5f;
		dY =  0;
	}
	else if(bUp==false&&bDown==false&&bRight==false&&bLeft==true){
	    bWalking = true;
		//gameObject.GetComponent(SpriteRenderer).sprite = spriteBackLeft;
		ChangeSprite("BackLeft");
		dX = 0;
		dY = 0.5f;
	}
	else if(bUp==false&&bDown==true&&bRight==false&&bLeft==false){
	    bWalking = true;
		//gameObject.GetComponent(SpriteRenderer).sprite = spriteFrontRight;
		ChangeSprite("FrontRight");
		dX = -0.5f;
		dY = 0;
	}
	else if(bUp==false&&bDown==false&&bRight==true&&bLeft==false){
	    bWalking = true;
		//gameObject.GetComponent(SpriteRenderer).sprite = spriteFrontLeft;
		ChangeSprite("FrontLeft");
		dX = 0;
		dY = -0.5f;
	}
	if(bWalking == false && bKilling == false){//If the character isn't moving, play crouch animation
	    ChangeSprite("Crouch");
	}
    
	fSpeed = 0.8f * Time.deltaTime;
	xPos += (dX*fSpeed);
	yPos += (dY*fSpeed);

	if(dX!=0 || dY !=0){//If the character is moving, slowly pan the camera towards the player character
	  //  transform.Find("Main Camera").transform.localPosition.x =0;
	    //transform.Find("Main Camera").transform.localPosition.y =0;
	    GameObject.Find("GameController").GetComponent(GameController).PanCamera(transform.position,false);
	}

    //Once movement direction has been established, the collision ball is moved first to check for collisions. If a collision is found, return the ball to the previous location and don't move the character.
	var ballY:float = yPos;// - 0.15f;
	var ballX:float = xPos;// - 0.15f;
	collisionBall.GetComponent(Transform).position = CartToIso(Vector2(ballX,ballY));
    //if(collisionBall.GetComponent(CollisionBallHandler).colliding == true){
    if(collisionBall.GetComponent(CollisionBallHandler).iColliding >0){
	    xPos -= (dX*fSpeed);
	    yPos -= (dY*fSpeed);
	    collisionBall.GetComponent(Transform).position = CartToIso(Vector2(ballX,ballY));
	    //collisionBall.GetComponent(Transform).position = CartToIso(Vector2(xPos,yPos));
	}else{
	    gameObject.GetComponent(Transform).position.x = CartToIso(Vector2(xPos,yPos)).x;
	    gameObject.GetComponent(Transform).position.y = CartToIso(Vector2(xPos,yPos)).y;
	}
}

public function ChangeSprite(direction:String){ //Updates the character sprint/animation based on current disguise ('spriteSet') and direction being faced.
    var renderer:SpriteRenderer = gameObject.GetComponent(SpriteRenderer);
    var animator:Animator = gameObject.GetComponent(Animator);

	switch(direction){
		case "Back":
		    if(currentSpriteSet == "Guard" || currentSpriteSet == "Seduce"){
		        animator.enabled = false;
			    renderer.sprite = guardSpriteBack;
		    }else if(currentSpriteSet == "Bartender"){
		        animator.enabled = false;
			    renderer.sprite = bartenderSpriteBack;
			}else if(currentSpriteSet == "Human"){
			    //renderer.sprite = humanSpriteBack;
			    animator.Play("humanLookBackStraight");
			}else{//The else condition is met if Skinrender is in his own 'skin'
			    animator.enabled=true;
			    //renderer.sprite = spriteBack;
			    if(bWalking==true){
			        animator.Play("WalkBackStraight");
			    }else{
			        animator.Play("LookBackStraight");
			    }
			}
			break;
		case "Front":
		    if(currentSpriteSet == "Guard"|| currentSpriteSet == "Seduce"){
		        animator.enabled = false;
			    renderer.sprite = guardSpriteFront;
		    }else if(currentSpriteSet == "Bartender"){
		        animator.enabled = false;
			    renderer.sprite = bartenderSpriteFront;
			}else if(currentSpriteSet == "Human"){
			    //renderer.sprite = humanSpriteFront;
			    animator.Play("humanLookFrontStraight");
			}else{
			    animator.enabled = true;
			    //renderer.sprite = spriteFront;
			    if(bWalking==true){
			        animator.Play("WalkFrontStraight");
			    }else{
			        animator.Play("LookFrontStraight");
			    }
			}
			break;
		case "Right":
		    if(currentSpriteSet == "Guard"|| currentSpriteSet == "Seduce"){
		        animator.enabled = false;
			    renderer.sprite = guardSpriteRight;
		    }else if(currentSpriteSet == "Bartender"){
		        animator.enabled = false;
			    renderer.sprite = bartenderSpriteRight;
			}else if(currentSpriteSet == "Human"){
			    //renderer.sprite = humanSpriteRight;
			    animator.Play("humanLookRight");
			}else{
			    animator.enabled = true;
			    //renderer.sprite = spriteRight;
			    if(bWalking==true){
			        animator.Play("WalkRight");
			    }else{
			        animator.Play("LookRight");
			    }
			}
			break;
		case "Left":
		    if(currentSpriteSet == "Guard"|| currentSpriteSet == "Seduce"){
		        animator.enabled = false;
			    renderer.sprite = guardSpriteLeft;
		    }else if(currentSpriteSet == "Bartender"){
		        animator.enabled = false;
			    renderer.sprite = bartenderSpriteLeft;
			}else if(currentSpriteSet == "Human"){
			    //renderer.sprite = humanSpriteLeft;
			    animator.Play("humanLookLeft");
			}else{
			    animator.enabled = true;
			    //renderer.sprite = spriteLeft;
			    if(bWalking==true){
			        animator.Play("WalkLeft");
			    }else{
			        animator.Play("LookLeft");
			    }
			}
			break;
		case "BackRight":
		    if(currentSpriteSet == "Guard"|| currentSpriteSet == "Seduce"){
		        animator.enabled = false;
			    renderer.sprite = guardSpriteBackRight;
		    }else if(currentSpriteSet == "Bartender"){
		        animator.enabled = false;
			    renderer.sprite = bartenderSpriteBackRight;
			}else if(currentSpriteSet == "Human"){
			    //renderer.sprite = humanSpriteBackRight;
			    animator.Play("humanLookBackRight");
			}else{
			    animator.enabled = true;
			    //renderer.sprite = spriteBackRight;
			    if(bWalking==true){
			        animator.Play("WalkBackRight");
			    }else{
			        animator.Play("LookBackRight");
			    }
			}
			break;
		case "BackLeft":
		    if(currentSpriteSet == "Guard"|| currentSpriteSet == "Seduce"){
		        animator.enabled = false;
			    renderer.sprite = guardSpriteBackLeft;
		    }else if(currentSpriteSet == "Bartender"){
		        animator.enabled = false;
			    renderer.sprite = bartenderSpriteBackLeft;
			}else if(currentSpriteSet == "Human"){
			    //renderer.sprite = humanSpriteBackLeft;
			    animator.Play("humanLookBackLeft");
			}else{
			    animator.enabled = true;
			    //renderer.sprite = spriteBackLeft;
			    if(bWalking==true){
			        animator.Play("WalkBackLeft");
			    }else{
			        animator.Play("LookBackLeft");
			    }
			}
			break;
		case "FrontRight":
		    if(currentSpriteSet == "Guard"|| currentSpriteSet == "Seduce"){
		        animator.enabled = false;
			    renderer.sprite = guardSpriteFrontRight;
		    }else if(currentSpriteSet == "Bartender"){
		        animator.enabled = false;
			    renderer.sprite = bartenderSpriteFrontRight;
			}else if(currentSpriteSet == "Human"){
			    //renderer.sprite = humanSpriteFrontRight;
			    animator.Play("humanLookFrontRight");
			}else{
			    animator.enabled = true;
			    //renderer.sprite = spriteFrontRight;
			    if(bWalking==true){
			        animator.Play("WalkFrontRight");
			    }else{
			        animator.Play("LookFrontRight");
			    }
			}
			break;
		case "FrontLeft":
		    if(currentSpriteSet == "Guard"|| currentSpriteSet == "Seduce"){
		        animator.enabled = false;
			    renderer.sprite = guardSpriteFrontLeft;
		    }else if(currentSpriteSet == "Bartender"){
		        animator.enabled = false;
			    renderer.sprite = bartenderSpriteFrontLeft;
			}else if(currentSpriteSet == "Human"){
			    //renderer.sprite = humanSpriteFrontLeft;
			    animator.Play("humanLookFrontLeft");
			}else{
			    animator.enabled = true;
			    //renderer.sprite = spriteFrontLeft;
			    if(bWalking==true){
			        animator.Play("WalkFrontLeft");
			    }else{
			        animator.Play("LookFrontLeft");
			    }
			}
		    break;
	    case "Crouch":
	        if(currentSpriteSet == "Guard"|| currentSpriteSet == "Seduce"){
	            animator.enabled = false;
	            renderer.sprite = guardSpriteFrontLeft;
	        }else if(currentSpriteSet == "Bartender"){
	            animator.enabled = false;
	            renderer.sprite = bartenderSpriteFrontLeft;
	        }else if(currentSpriteSet == "Human"){
	            animator.Play("humanLookFrontLeft");
	        }else{
	            animator.enabled = true;
	            animator.Play("Crouch");
	        }
	        break;
	}
}

function Hide(){//Used as part of the old 'shadow' mechanic to hide the player character
    if(bHidden==false){
        bHidden = true;
        gameObject.GetComponent(SpriteRenderer).color = Color.black;
        UIReference.Visibility(false);
    }
}

function UnHide(){//Used as part of the old 'shadow' mechanic to unhide the player character
    if(bHidden==true){
        bHidden = false;
        gameObject.GetComponent(SpriteRenderer).color = defaultColour;
        UIReference.Visibility(true);
    }
}

function CheckKeys(){ //Keeps track of what buttons the player is currently pressing
    //Check if key was pressed
    if(Input.GetMouseButtonUp(1)){
        bUp=false;
        bDown=false;
        bLeft=false;
        bRight=false;
    }
    var bKeyBoardInUse:boolean = false;
	if(Input.GetKeyDown("up") || Input.GetKeyDown("w")){
	    bUp = true;
	    bKeyBoardInUse=true;
	}
	if(Input.GetKeyDown("down")|| Input.GetKeyDown("s")){
	    bDown = true;
	    bKeyBoardInUse=true;
	}
	if(Input.GetKeyDown("left")|| Input.GetKeyDown("a")){
	    bLeft=true;
	    bKeyBoardInUse=true;
	}
	if(Input.GetKeyDown("right")|| Input.GetKeyDown("d")){
	    bRight = true;
	    bKeyBoardInUse=true;
	}
	
	//Checks if key was released
	if(Input.GetKeyUp("up") || Input.GetKeyDown("w")){
		bUp = false;
	}
	if(Input.GetKeyUp("down") || Input.GetKeyDown("s")){
		bDown = false;
	}
	if(Input.GetKeyUp("left")|| Input.GetKeyDown("a")){
		bLeft = false;
	}
	if(Input.GetKeyUp("right")|| Input.GetKeyDown("d")){
		bRight = false;
	}

	if(Input.GetKeyUp("q")){
	    Death();
	}

	if(bKeyBoardInUse==false){//If the keyboard isn't being used, check for Mouse movement commands
        CheckMouseControls();
	}
}

function CheckMouseControls(){ //Allows the player to control movement by holding down the right mouse button. The player will not move to a specified location, but will move in the direction of the mouse.
    if(Input.GetMouseButton(1)){
        var realMousePosition:Vector3 = transform.Find("Main Camera").gameObject.GetComponent(Camera).ScreenToWorldPoint(Input.mousePosition);
        Debug.DrawLine(transform.position,realMousePosition,Color.red);
        var xDifference:float = realMousePosition.x - transform.position.x;
        var yDifference:float = realMousePosition.y - transform.position.y;
        var angle:float;
        if(yDifference>=0){
            if(xDifference>=0){
                angle = ToDegrees(Mathf.Atan(xDifference/yDifference));
            }
            else{
                angle = 270+ToDegrees(Mathf.Atan(yDifference/Mathf.Sqrt(xDifference*xDifference)));
            }
        }else{
            if(xDifference>=0){
                angle = 90+ToDegrees(Mathf.Atan(Mathf.Sqrt(yDifference*yDifference)/xDifference));
            }else{
                angle = 180+ToDegrees(Mathf.Atan(Mathf.Sqrt(xDifference*xDifference)/(Mathf.Sqrt(yDifference*yDifference))));
            }
        }
        if(angle <25f || angle >335f){
            bUp=true;
            bDown=false;
            bLeft=true;
            bRight=false;
        }else if(angle >25 && angle<65){
            bUp=true;
            bDown=false;
            bLeft=false;
            bRight=false;
        }else if(angle >65 && angle<115){
            bUp=true;
            bDown=false;
            bLeft=false;
            bRight=true;
        }else if(angle >115 && angle<155){
            bUp=false;
            bDown=false;
            bLeft=false;
            bRight=true;
        }else if(angle >155 && angle<205){
            bUp=false;
            bDown=true;
            bLeft=false;
            bRight=true;
        }else if(angle >205 && angle<245){
            bUp=false;
            bDown=true;
            bLeft=false;
            bRight=false;
        }else if(angle >245 && angle<295){
            bUp=false;
            bDown=true;
            bLeft=true;
            bRight=false;
        }else if(angle >295 && angle<335){
            bUp=false;
            bDown=false;
            bLeft=true;
            bRight=false;
        }
    }
}

//Isometric Utility functions---

function CartToIso(point:Vector2):Vector2{ //Switched Cartesian point to Isometric
	var tempPoint:Vector2 = new Vector2(0,0);
	tempPoint.x = point.x - point.y;
	tempPoint.y = (point.x + point.y)/2;
	return tempPoint;
} 

function IsoToCart(point:Vector2):Vector2{ //Switches Isometric point to Cartesian.
	var tempPoint:Vector2 = new Vector2(0,0);
	tempPoint.x = (2 * point.y + point.x) /2;
	tempPoint.y = (2 * point.y - point.x) /2;
	return tempPoint;
}

function ToDegrees(radianAngle:float){ //Converts radians to degrees
    return radianAngle*180/Mathf.PI;
}

function checkScalarDistance(character1:Vector2,character2:Vector2):float{ //Finds the distance between two locations. 
	var xDistance:float = character1.x - character2.x;
	var yDistance:float = character1.y - character2.y;
	
	var vectorDistance:float = Mathf.Sqrt((xDistance*xDistance)+(yDistance*yDistance));
	return vectorDistance;
}