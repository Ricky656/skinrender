#pragma strict

//References
private var parentPuzzle:GameObject;

public var inventoryIcon:GameObject;
public var statusIcon:GameObject;
//-----------------
//View Cone Data
private var fInnerVisionRadius:float = 0.2f;
private var iNumberOfAngles:int = 12; 
private var innerMesh:GameObject;

private var fOuterVisionRadius:float = 1.8f;
private var iOuterNumberOfAngles:int = 30;
private var outerMesh:GameObject;
public var iVisionFacing:int = 0;
private var iBufferVisionFacing:int;
private var fOuterVisionWidth:float = 160; //In Degrees

public var visionMaterial:Material;

private var bShowingVectors:boolean = true;
//-----------------
//Movement Variables
private var tileList:GameObject[];
private var currentDestination:Vector2;
private var currentPath:Array;
private var walkIndex:int;
private var bPathingDone:boolean;
private var fSpeed:float = 0.3f;
public var xPos:float;
public var yPos:float;
private var dX:float;
private var dY:float;
public var collisionBall:GameObject;

public var PatrolPath1:GameObject[];
public var PatrolPath2:GameObject[];
public var iBehaviour:int;
private var iWaypointNo:int;

private var reactTarget:GameObject;
private var reactTime:int;

private var bTurning:boolean;

private var forcedTarget:GameObject;
private var returnSpot:GameObject;
private var bForcedMove:boolean;
//-----------------
private var bEnabled:boolean;

//spriteVariables
public var spriteBack:Sprite;
public var spriteFront:Sprite;
public var spriteLeft:Sprite;
public var spriteRight:Sprite;
public var spriteFrontLeft:Sprite;
public var spriteFrontRight:Sprite;
public var spriteBackLeft:Sprite;
public var spriteBackRight:Sprite;
public var spriteKnockedOut:Sprite;

//item sprites
public var blueKeySprite:Sprite;
public var lovelornIconSprite:Sprite;
public var sleepIconSprite:Sprite;
public var seduceIconSprite:Sprite;
public var bartenderIconSprite:Sprite;
public var shoutIconSprite:Sprite;

//------------
//Data
public var bFriend:boolean;
public var charName:String;

public var traits:String[];

public var sType:String;
public var inventory:String[];

public var unlockDoor:GameObject;

private var bufferViewConeTimer:float;
private var bufferUsed:boolean;
private var bufferDirection:String;

private var bDrunk:boolean;
private var drunkTimer:float;

private var bKnockedOut:boolean;
private var knockedOutTimer:float;

public var currentState:int;

public var conversations:Array;
public var conversationIndex:int;
public var conversationLocked:boolean;

//Animation variables
public var sweeping:boolean;
private var bLeanDrinking:boolean;
//----------------------

private var prevBehaviour:int;
private var shootTarget:GameObject;
//-----------


function Start () {
    currentState = GameState.Playing;
}

function Setup(){//Sets up necessary NPC data

	var startPosition:Vector2 = IsoToCart(Vector2(transform.position.x,transform.position.y)); //Sets up character position in the Isometric space.
	xPos = startPosition.x;
	yPos = startPosition.y;
	parentPuzzle = transform.parent.gameObject;
    //fSpeed = 0.2f; //* Time.deltaTime;

	//Choose Patrol and Start Moving
	StartPatrol();


	for(var iCounter:int=0;iCounter<traits.length;iCounter++){//Sets up icons that display traits above a character 
        if(traits[iCounter] == "lovelorn"){
            statusIcon.GetComponent(SpriteRenderer).sprite = lovelornIconSprite;
            statusIcon.GetComponent(SpriteRenderer).enabled = true;
        }
    }
    //Sets up icon to show a character that has an ability the player can use. 
    if(sType == "Seduce"){
        statusIcon.GetComponent(SpriteRenderer).sprite = seduceIconSprite;
        statusIcon.GetComponent(SpriteRenderer).enabled = true;
    }
    if(sType == "Bartender"){
        statusIcon.GetComponent(SpriteRenderer).sprite = bartenderIconSprite;
        statusIcon.GetComponent(SpriteRenderer).enabled = true;
    }
    if(sType == "Shout"){
        statusIcon.GetComponent(SpriteRenderer).sprite = shoutIconSprite;
        statusIcon.GetComponent(SpriteRenderer).enabled = true;
    }

    collisionBall.GetComponent(MeshRenderer).enabled = false;//Hides the collision ball from the game
    
    //ALL CONVERSATION SETUPS------------------
    //Conversation objects are created, their data filled in to describe a particular interaction; and then the objects are added to the appropriate array

    conversationIndex=0;
    conversationLocked = false;
    var newConversation:Conversation;
    if(charName == "Marceau"){ //MARCEAU CONVERSATIONS
        fSpeed = 0.65f;
        conversations = new Array();
        newConversation = new Conversation();
        newConversation.person1 = GameObject.Find("Marceau");
        newConversation.speech1 = new String[1];
        newConversation.speech2 = new String[1];
        newConversation.speech1[0] = "Sebastien! That was a great night! \nYour Inn has really come together. \nI bet you and Liz are so proud.";
        newConversation.speech2[0] = "Hey, notice Didier looking at Marie over there? \nYou should get her to talk to him, you know \nhe'll never make the first move.";
        conversations.Push(newConversation);

        newConversation = new Conversation();
        newConversation.speech1 = new String[1];
        newConversation.person1 = GameObject.Find("Marceau");
        newConversation.speech1[0] = "This ale's really something you know? \nAsk Loup for some if you get the chance.";
        conversations.Push(newConversation);
        //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
    }else if(charName=="Didier"){ //DIDIER CONVERSATIONS
        conversations = new Array();
        newConversation = new Conversation();
        newConversation.speech1 = new String[1];
        newConversation.speech2 = new String[1];
        newConversation.person1 = GameObject.Find("Didier");
        newConversation.speech1[0] = "Bonjour Sebastien, care to drink with me? \nIt's really good of you to let us stay here \nafter hours by the way, this place really keeps us together.";
        newConversation.speech2[0] = "What am I looking at? Oh, er, nothing. \nI'm just thinking.";
        conversations.Push(newConversation);

        newConversation = new Conversation();
        newConversation.speech1 = new String[1];
        newConversation.speech2 = new String[1];
        newConversation.person1 = GameObject.Find("Didier");
        newConversation.speech1[0] = "You should look out with those guys that were \nhere earlier. I think they were those Vendeans. \nI know you support them, we all do... \n";
        newConversation.speech2[0] = "...but it's best done in secret.";
        conversations.Push(newConversation);
        //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
    }else if(charName=="Marie"){ //MARIE CONVERSATIONS
        conversations = new Array();
        newConversation = new Conversation();
        newConversation.speech1 = new String[1];
        newConversation.person1 = GameObject.Find("Marie");
        //newConversation.speech2 = new String[1];
        newConversation.speech1[0] = "Monsier Everard! I did not see you there. \nThose guys left this place in quite a mess earlier, \nDid you see those weapons? I think they were rebels.";
        //newConversation.speech2[0] = "What am I looking at? Oh, er, nothing. \nI'm just thinking.";
        conversations.Push(newConversation);

        newConversation = new Conversation();
        newConversation.speech1 = new String[1];
        newConversation.person1 = GameObject.Find("Marie");
        //newConversation.speech2 = new String[1];
        newConversation.speech1[0] = "Didier? Really? I had no idea! \nWell if you're sure? I'll just say hello.";
        //newConversation.speech2[0] = "...but it's best done in secret.";
        conversations.Push(newConversation);
        //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
    }else if(charName=="Loup"){ //LOUP CONVERSATIONS
        conversations = new Array();
        newConversation = new Conversation();
        newConversation.person1 = GameObject.Find("Loup_Bartender");
        newConversation.speech1 = new String[1];
        newConversation.speech2 = new String[1];
        newConversation.speech1[0] = "Hey Boss. That was a great night we Just had! I hope \nyou know what you're doing with those Vendeans though...";
        newConversation.speech2[0] = "...if word gets out that we've been serving \nrebels then I fear something bad will happen. \nYou have to look out for Liz and your little boy.";
        conversations.Push(newConversation);

        newConversation = new Conversation();
        newConversation.speech1 = new String[1];
        newConversation.person1 = GameObject.Find("Loup_Bartender");
        //newConversation.speech2 = new String[1];
        newConversation.speech1[0] = "Hey, while I'm here. Want another drink? \nThis stuff's from your brewery; it's strong!";
        //newConversation.speech2[0] = "...but it's best done in secret.";
        conversations.Push(newConversation);
        //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
    }

    if(bFriend==true){ //Changes the range indicator colour to indicate to the Player that pressing the kill/talk button will start a conversation. 
        transform.Find("targetIndicator").GetComponent(SpriteRenderer).color = Color.yellow;
    }
}

function StartPatrol(){ //Sets the character's initial behaviour and starts the patrol
	iBehaviour = 2;
	NextPatrolWaypoint(iBehaviour);
	bEnabled = true;
}

function Update () {
    if(currentState==GameState.Playing){
        if(bEnabled==true && iBehaviour <10){ //Patrol behaviours are all represented by ints under 10

            if(bTurning ==false){ //If the character isn't currently set to look at a location, the walk function is called
                Walk();
            }else{
                if(iBehaviour==2){//Different behaviours switches which patrol array the NPC refers to, these behaviours can be expanded from 2 up to and including 9
                    TurnToFace(PatrolPath1[iWaypointNo]);
                }else if(iBehaviour==3){
                    TurnToFace(PatrolPath2[iWaypointNo]);
                }
                
            }
        }else if(bEnabled && iBehaviour ==10){ //10 represents the "reacting" behaviour, which is always a 'look'
            TurnToFace(reactTarget);
        }else if(bEnabled && iBehaviour == 11){ //11 is the "shooting" behaviour
            if(GetComponent(Animator)!=null){
                ShootAt(shootTarget);
                iBehaviour = 12; 
            }else{
                iBehaviour = prevBehaviour;
                Debug.Log("could not shoot due to lack of animator component");
            }
        }
        if(bEnabled && inventoryIcon!=null){
            UpdateInventorySprites();
        }
        if(bEnabled && bufferUsed == true && Time.time>=bufferViewConeTimer){ //When an NPC changes facing direction, instead of immediately switching the vision arc, this statement uses a short timer. 
            //This removes weird jitters in vision resulting in a Player feeling cheated when a character instantly looks at them for less than a second
            bufferUsed = false;
            iVisionFacing = iBufferVisionFacing;
        }
        if(bEnabled==true && bDrunk==true && Time.time>=drunkTimer){//This statement checks the 'drunk' timer to disable an NPC after a small wait when the Player uses the 'spike drink' ability.
            bDrunk = false;
            BecomeKnockedOut();
        }
        if(bEnabled == false && bKnockedOut ==true){//This wakes up a knocked out NPC after a given time period. 
            if(Time.time>=knockedOutTimer){
                WakeUp();
            }
        }
        if(bEnabled==true){
            if(Input.GetKeyDown("v")){//Allows player to disable the graphical overlay for the enemy vision
                ToggleVision();
            }
            statusIcon.transform.position.z =-8;
            inventoryIcon.transform.position.z=-8;
            if(bKnockedOut == false && bFriend == false){//Creates the enemy vision objects
                if(bShowingVectors==true){
                    CalculateVision();
                }
                CheckVisionCollision(); //Checks if the player is in-sight of NPC
            }
        }
    }
}

public function ChangeBehaviour(newRoute:int){ //Switches NPCs current behaviour
    iBehaviour = newRoute;
    iWaypointNo=0;
    bTurning = false;
    NextPatrolWaypoint(iBehaviour);
}

public function PlayConversation(){ //Checks for stored conversations and then plays them
    if(conversations!=null){
        if(conversationIndex<conversations.length){
            GameObject.Find("GameController").GetComponent(GameController).StartConversation(conversations[conversationIndex]);
            if(conversationLocked==false){
                conversationIndex++;
                GameObject.Find("IntroManager").GetComponent(IntroHandler).SpokenTo(charName); //Used to keep track of which characters the player has spoken to in the intro section
            }
        }
    }
}

public function ToggleVision(){ //Toggles between showing the character vision objects
    bShowingVectors = !bShowingVectors;
    if(outerMesh!=null){
        if(outerMesh.GetComponent(MeshFilter)!=null){
            outerMesh.GetComponent(MeshFilter).mesh.Clear();
            innerMesh.GetComponent(MeshFilter).mesh.Clear();
        }
    }
}

function CheckVisionCollision(){//Checks to see if Player is within the vision of this character
    var playerPos:Vector3 = gameObject.Find("Player_Character").transform.position;
    
    //InnerVision collision check
    if((playerPos - transform.position).magnitude<fInnerVisionRadius && (playerPos-transform.position).magnitude>-fInnerVisionRadius){ //The inner, peripheral vision of a character is easy to check, as it checks a full circle
        CheckPlayerInArc(true);
    }

    //For the outer vision, the angle between the player and this character is found using their Cartesian coordinates. If the angle is within the bounds of the current direction the NPC is facing, a function to check for cover is called.
    var angleToPlayer:float =  FindAngle(IsoToCart(transform.position),IsoToCart(playerPos));
    if((IsoToCart(playerPos) - IsoToCart(transform.position)).magnitude<fOuterVisionRadius && (IsoToCart(playerPos)-IsoToCart(transform.position)).magnitude>-fOuterVisionRadius){
        switch(iVisionFacing){//iVisionFacing stores the direction the NPC is facing, I would probably use an enum for this if I iterated on it further
            case 0:
                if(angleToPlayer > ((360/8 * 2) - fOuterVisionWidth/2) && angleToPlayer < ((360/8 * 2) + fOuterVisionWidth/2)){ //Particular attention must be paid to accomodating for issues encountered when the facing puts the bounds of the vision past the 0/360 degree position
                    CheckPlayerInArc(false);
                }
                break;
            case 1:
                if(angleToPlayer > 325 || angleToPlayer < ((360/8 * 1) + fOuterVisionWidth/2)){
                    CheckPlayerInArc(false);
                }
                break;
            case 2:
                if(angleToPlayer > (360 - fOuterVisionWidth/2) || angleToPlayer < ((360/8 * 0) + fOuterVisionWidth/2)){
                    CheckPlayerInArc(false);
                }
                break;
            case 3:
                if(angleToPlayer > ((360/8 * 7) - fOuterVisionWidth/2) || angleToPlayer < 35){
                    CheckPlayerInArc(false);
                }
                break;
            case 4:
                if(angleToPlayer > ((360/8 * 6) - fOuterVisionWidth/2) && angleToPlayer < ((360/8 * 6) + fOuterVisionWidth/2)){
                    CheckPlayerInArc(false);
                }
                break;
            case 5:
                if(angleToPlayer > ((360/8 * 5) - fOuterVisionWidth/2) && angleToPlayer < ((360/8 * 5) + fOuterVisionWidth/2)){
                    CheckPlayerInArc(false);
                }
                break;
            case 6:
                if(angleToPlayer > ((360/8 * 4) - fOuterVisionWidth/2) && angleToPlayer < ((360/8 * 4) + fOuterVisionWidth/2)){
                    CheckPlayerInArc(false);
                }
                break;
            case 7:
                if(angleToPlayer > ((360/8 * 3) - fOuterVisionWidth/2) && angleToPlayer < ((360/8 * 3) + fOuterVisionWidth/2)){
                    CheckPlayerInArc(false);
                }
                break;
        }
        /*if(iVisionFacing==1 && angleToPlayer > ((360/8 * 1) - fOuterVisionWidth/2) && angleToPlayer < ((360/8 * 1) + fOuterVisionWidth/2)){
            CheckPlayerInArc(false);
        }else if(iVisionFacing==2 && angleToPlayer > (360 - fOuterVisionWidth/2) || angleToPlayer < ((360/8 * 0) + fOuterVisionWidth/2)){
            CheckPlayerInArc(false);
        }else if(iVisionFacing==3 && angleToPlayer > ((360/8 * 7) - fOuterVisionWidth/2)&& angleToPlayer < ((360/8 * 7) + fOuterVisionWidth/2)){
            CheckPlayerInArc(false);
        }else if(iVisionFacing==4 && angleToPlayer > ((360/8 * 6) - fOuterVisionWidth/2) && angleToPlayer < ((360/8 * 6) + fOuterVisionWidth/2)){
            CheckPlayerInArc(false);
        }else if(iVisionFacing==5 && angleToPlayer > ((360/8 * 5) - fOuterVisionWidth/2) && angleToPlayer < ((360/8 * 5) + fOuterVisionWidth/2)){
            CheckPlayerInArc(false);
        }else if(iVisionFacing==6 && angleToPlayer > ((360/8 * 4) - fOuterVisionWidth/2) && angleToPlayer < ((360/8 * 4) + fOuterVisionWidth/2)){
            CheckPlayerInArc(false);
        }else if(iVisionFacing==7 && angleToPlayer > ((360/8 * 3) - fOuterVisionWidth/2) && angleToPlayer < ((360/8 * 3) + fOuterVisionWidth/2)){
            CheckPlayerInArc(false);
        }else if(iVisionFacing==0 && angleToPlayer > ((360/8 * 2) - fOuterVisionWidth/2) && angleToPlayer < ((360/8 * 2) + fOuterVisionWidth/2)){
            CheckPlayerInArc(false);
        }*/
    }
}

function CheckPlayerInArc(inner:boolean){ //This checks to see if the player is hidden behind an obstacle that NPCs cannot see through.

    var playerPos:Vector3 = gameObject.Find("Player_Character").transform.position;
    var rayHit:RaycastHit2D;
    var layerMask:int = 1 << LayerMask.NameToLayer("VisionBlockers");//Ensures we are only checking against things that can block vision

    if(inner==true){//A boolean is passed to this function to differentiate when the inner or outer visions are behind checked. I think I would clean this section up after another pass.
        rayHit = Physics2D.Raycast(new Vector2(transform.position.x,transform.position.y), new Vector2((playerPos-transform.position).x,(playerPos-transform.position).y), fInnerVisionRadius, layerMask);
        if(rayHit.collider ==null){
            PlayerSpotted();
        }else{
            if(rayHit.collider.gameObject.tag == "Player"){
                PlayerSpotted();
            }
        }
    }else{
        rayHit = Physics2D.Raycast(new Vector2(transform.position.x,transform.position.y), new Vector2((playerPos-transform.position).x,(playerPos-transform.position).y), fOuterVisionRadius, layerMask);
        if(rayHit.collider ==null){
            PlayerSpotted();
        }else{
            if(rayHit.collider.gameObject.tag == "Player"){
                PlayerSpotted();
            }
        }
    }
   
}

public function InPlayerArc(playerObject:GameObject):boolean{ //This checks to see if the player is currently behind the NPC, and can be allowed to kill it.
    var playerPos:Vector3 = playerObject.transform.position;
    switch(iVisionFacing){
        case 1:
            if(FindAngle(IsoToCart(transform.position),IsoToCart(playerPos)) > ((360/8 * 5) - fOuterVisionWidth/2) && FindAngle(IsoToCart(transform.position),IsoToCart(playerPos)) < ((360/8 * 5) + fOuterVisionWidth/2)){
                return true;
            }
            break;
        case 2:
            if(FindAngle(IsoToCart(transform.position),IsoToCart(playerPos)) > ((360/8 * 4) - fOuterVisionWidth/2) && FindAngle(IsoToCart(transform.position),IsoToCart(playerPos)) < ((360/8 * 4) + fOuterVisionWidth/2)){
                return true;
            }
            break;
        case 3:
            if( FindAngle(IsoToCart(transform.position),IsoToCart(playerPos)) > ((360/8 * 3) - fOuterVisionWidth/2) && FindAngle(IsoToCart(transform.position),IsoToCart(playerPos)) < ((360/8 * 3) + fOuterVisionWidth/2)){
                return true;
            }
            break;
        case 4: 
            if( FindAngle(IsoToCart(transform.position),IsoToCart(playerPos)) > ((360/8 * 2) - fOuterVisionWidth/2) && FindAngle(IsoToCart(transform.position),IsoToCart(playerPos)) < ((360/8 * 2) + fOuterVisionWidth/2)){
                return true;
            }
            break;
        case 5:
            if( FindAngle(IsoToCart(transform.position),IsoToCart(playerPos)) > ((360/8 * 1) - fOuterVisionWidth/2)&& FindAngle(IsoToCart(transform.position),IsoToCart(playerPos)) < ((360/8 * 1) + fOuterVisionWidth/2)){
                return true;
            }
            break;
        case 6:
            if( FindAngle(IsoToCart(transform.position),IsoToCart(playerPos)) > ((360/8 * 0) - fOuterVisionWidth/2) && FindAngle(IsoToCart(transform.position),IsoToCart(playerPos)) < ((360/8 * 0) + fOuterVisionWidth/2)){
                return true;
            }
            break;
        case 7:
            if( FindAngle(IsoToCart(transform.position),IsoToCart(playerPos)) > ((360/8 * 7) - fOuterVisionWidth/2)&& FindAngle(IsoToCart(transform.position),IsoToCart(playerPos)) < ((360/8 * 7) + fOuterVisionWidth/2)){
                return true;
            }
            break;
        case 0:
            if( FindAngle(IsoToCart(transform.position),IsoToCart(playerPos)) > ((360/8 * 6) - fOuterVisionWidth/2) && FindAngle(IsoToCart(transform.position),IsoToCart(playerPos)) < ((360/8 * 6) + fOuterVisionWidth/2)){
                return true;
            }
            break;
    }
    return false;
}

function FindAngle(from:Vector3,to:Vector3):float{ //Utility function used to find angle between two points in the game. 

    var xDifference:float = to.x- from.x;
    var yDifference:float = to.y - from.y;
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

    return angle;
}

function PlayerSpotted(){//Function called when the vision system consideres the Player to be 'seen'.
    if(GameObject.Find("Player_Character").GetComponent(Player_Controller).bDisguised==false){
        GameObject.Find("Player_Character").transform.Find("CollisionBall").GetComponent(CollisionBallHandler).iVisible = 1;
    }
}

function BecomeKnockedOut(){ //Knocks out eh NPC when the Bartender's 'Spike Drink' ability has been used, and the 'drunk' timer has expired.
    //Icons and enemy vision is turned off, and the 'knockedOut' timer is started, to wake the character up again

    bEnabled = false;
    bKnockedOut = true;
    knockedOutTimer = Time.time +15;
    //Change to knockedout sprite
    GetComponent(SpriteRenderer).sprite = spriteKnockedOut;
    statusIcon.GetComponent(SpriteRenderer).sprite = sleepIconSprite;
    statusIcon.GetComponent(SpriteRenderer).enabled = true;
    if(outerMesh!=null){
        if(outerMesh.GetComponent(MeshFilter)!=null){
            outerMesh.GetComponent(MeshFilter).mesh.Clear();
            innerMesh.GetComponent(MeshFilter).mesh.Clear();
        }
    }
}

function WakeUp(){ //Wakes up the character after being knocked out by the 'spike drin' ability
    bEnabled = true;
    bKnockedOut = false;
    //ChangeBackToNormalSprite
    statusIcon.GetComponent(SpriteRenderer).enabled = false;
    for(var iCounter:int=0;iCounter<traits.length;iCounter++){
        if(traits[iCounter] == "lovelorn"){
            statusIcon.GetComponent(SpriteRenderer).sprite = lovelornIconSprite;
            statusIcon.GetComponent(SpriteRenderer).enabled = true;
        }
    }
    if(sType == "Seduce"){
        statusIcon.GetComponent(SpriteRenderer).sprite = seduceIconSprite;
        statusIcon.GetComponent(SpriteRenderer).enabled = true;
    }
}

function BecomeSeduced(target:GameObject,returnTarget:GameObject){ //Forces the NPC to walk to a specific point, given by the Player with either the 'Seduce' or 'Guard Shout' abilities

    StopReact();//Stops reacting to another patrol route, to allow the NPC to properly behave after an ability is used on it.
    PatrolPath1[iWaypointNo].GetComponent(PathfindingTileHandler).RelinquishReactive(); //Allows other NPCs that were previously reacting to this one to return to their usual patrol path
    forcedTarget = target;
    returnSpot = returnTarget;
    bForcedMove = true;
    Move(forcedTarget);
    bTurning  = false;
    walkIndex=currentPath.length-1;
}

function CalculateVision(){ //This function gathers an array of points that will be joined up to create the area the NPC can 'see'.
    //Raycasts are sent out from the NPC to create an arc of a circle based on the facing of the character, if the raycast hits a vision blocker then this point is used to allow the player to hide behind things.
    var nextPointCart:Vector3;
    var truePosition:Vector3;
    var nextPointIso:Vector3;

    var rayHit:RaycastHit2D;
    var direction:Vector3;
    var distance:float;
    var layerMask:int = 1 << LayerMask.NameToLayer("VisionBlockers");

    var angle:float = 0f;
    //Inner Circular Vision
    var innerCirclePoints:Array = new Array();
    innerCirclePoints.Push(new Vector3(transform.position.x,transform.position.y,0));
    for(var x:int =0 ;x< iNumberOfAngles ; x++){
        nextPointCart = new Vector3(0,0,0);
        truePosition = new Vector3(0,0,0);
        
        truePosition.x = IsoToCart(new Vector2(transform.position.x,transform.position.y)).x;
        truePosition.y = IsoToCart(new Vector2(transform.position.x,transform.position.y)).y;
        nextPointCart.x = truePosition.x + (fInnerVisionRadius * Mathf.Cos(angle));
        nextPointCart.y = truePosition.y + (fInnerVisionRadius * Mathf.Sin(angle));
        nextPointIso = new Vector3(0,0,0);
        nextPointIso.x = CartToIso(new Vector2(nextPointCart.x,nextPointCart.y)).x;
        nextPointIso.y = CartToIso(new Vector2(nextPointCart.x,nextPointCart.y)).y;

        direction = nextPointIso - transform.position;
        distance = direction.magnitude;
        //direction = direction/distance;
        rayHit = Physics2D.Raycast(new Vector2(transform.position.x,transform.position.y), new Vector2(direction.x,direction.y), distance, layerMask);
        if(rayHit.collider !=null){
            nextPointIso = rayHit.point;
        }
        innerCirclePoints.Push(nextPointIso);
        angle += Mathf.PI*2 / iNumberOfAngles;  
    }

    innerCirclePoints.Push(innerCirclePoints[1]);
    innerCirclePoints.Push(innerCirclePoints[innerCirclePoints.length-1]);
    CreateInnerVision(innerCirclePoints); //Once all the points are found, a function to create the visible mesh is called - passing in the points. 

    var outerCirclePoints:Array = new Array();
    var fBaseAngle:float = iVisionFacing*(360/8)*(Mathf.PI/180);
    angle = fBaseAngle - ((fOuterVisionWidth/2)*Mathf.PI/180);
    outerCirclePoints.push(new Vector3(transform.position.x,transform.position.y,0));
    for(var y:int =0 ;y< iOuterNumberOfAngles+1; y++){
        nextPointCart = new Vector3(0,0,0);
        truePosition = new Vector3(0,0,0);

        truePosition.x = IsoToCart(new Vector2(transform.position.x,transform.position.y)).x;
        truePosition.y = IsoToCart(new Vector2(transform.position.x,transform.position.y)).y;
        nextPointCart.x = truePosition.x + (fOuterVisionRadius * Mathf.Cos(angle));
        nextPointCart.y = truePosition.y + (fOuterVisionRadius * Mathf.Sin(angle));
        nextPointIso.x = CartToIso(new Vector2(nextPointCart.x,nextPointCart.y)).x;
        nextPointIso.y = CartToIso(new Vector2(nextPointCart.x,nextPointCart.y)).y;
        direction = nextPointIso - transform.position;
        distance = direction.magnitude;
        //direction = direction/distance;
        rayHit = Physics2D.Raycast(new Vector2(transform.position.x,transform.position.y), new Vector2(direction.x,direction.y), distance, layerMask);
        if(rayHit.collider !=null){
            nextPointIso = rayHit.point;
        }
        outerCirclePoints.push(nextPointIso);
        angle += (fOuterVisionWidth*Mathf.PI/180)/iOuterNumberOfAngles;
    }
    CreateOuterVision(outerCirclePoints);//Once all the points are found, a function to create the visible mesh is called - passing in the points. 
}

function CreateOuterVision(points:Array){ //Creates the visible mesh for the outer vision
    var filter:MeshFilter;
    //var renderer:MeshRenderer;
    if(outerMesh!=null){
        outerMesh.GetComponent(MeshFilter).mesh.Clear();
        filter = outerMesh.GetComponent(MeshFilter);
        //renderer = outerMesh.GetComponent(MeshRenderer);
    }else{
        outerMesh = new GameObject();
        outerMesh.transform.parent = this.gameObject.transform;
        //renderer = outerMesh.AddComponent(MeshRenderer);
        filter = outerMesh.AddComponent(MeshFilter);
        outerMesh.AddComponent(MeshRenderer);
        outerMesh.GetComponent(MeshRenderer).material = visionMaterial;
    }
    var mesh:Mesh = filter.mesh;
    
        //var uvs:Vector2[] = new Vector2[points.length];
    var triangles:int[] = new int[(points.length-2) *3];

        //uvs
        //uvs[0] = new Vector2(1,1);
        //triangles
    var v1:int =0 ;
    var v2:int = points.length-1 ;
    var v3:int = points.length-2 ;
        /* for(var x:int = 0; x<triangles.length-3; x+=3){
             triangles[x] = v1;
             triangles[x+1] = v2;
             triangles[x+2] = v3;
     
             v2++;
             v3++;
         }*/
    for(var x:int = 0; x<triangles.length; x+=3){
        triangles[x] = v1;
        triangles[x+1] = v2;
        triangles[x+2] = v3;

        v2--;
        v3--;
    }
    var vertices:Vector3[] = new Vector3[points.length];
    for(var y:int=0 ; y < points.length;y++){
        vertices[y] = points[y];
    }
    
    mesh.vertices = vertices;
        //mesh.uv = uvs;
    mesh.triangles = triangles; 

    mesh.RecalculateNormals();
    mesh.RecalculateBounds();
    mesh.Optimize();
    mesh.name = "OuterVisionMesh";

    //renderer.material = visionMaterial;
    filter.mesh = mesh;
    outerMesh.transform.position = new Vector3(0,0,0);
    outerMesh.GetComponent(MeshRenderer).material.color.a = 0.3f;
    outerMesh.GetComponent(MeshRenderer).sortingOrder = 2;
    
    mesh=null;
    filter = null;
    //renderer=null;
}

function CreateInnerVision(points:Array){//Creates the visible mesh for the inner vision
    var filter:MeshFilter;
    //var renderer:MeshRenderer;
    if(innerMesh!=null){
        innerMesh.GetComponent(MeshFilter).mesh.Clear();
        filter = innerMesh.GetComponent(MeshFilter);
        //renderer = innerMesh.GetComponent(MeshRenderer);
    }else{
        innerMesh = new GameObject();
        innerMesh.transform.parent = this.gameObject.transform;
        //renderer = innerMesh.AddComponent(MeshRenderer);
        filter = innerMesh.AddComponent(MeshFilter);
        innerMesh.AddComponent(MeshRenderer);
        innerMesh.GetComponent(MeshRenderer).material = visionMaterial;
    }
    
    var mesh:Mesh = filter.mesh;
    
    //var uvs:Vector2[] = new Vector2[points.length];
    var triangles:int[] = new int[(points.length-2) *3];

    //uvs
    //uvs[0] = new Vector2(1,1);
    //triangles

    var v1:int =0 ;
    var v2:int = points.length-1 ;
    var v3:int = points.length-2 ;
   /* for(var x:int = 0; x<triangles.length-3; x+=3){
        triangles[x] = v1;
        triangles[x+1] = v2;
        triangles[x+2] = v3;

        v2++;
        v3++;
    }*/

    for(var x:int = 0; x<triangles.length; x+=3){
        triangles[x] = v1;
        triangles[x+1] = v2;
        triangles[x+2] = v3;

        v2--;
        v3--;
    }
    var vertices:Vector3[] = new Vector3[points.length];
    for(var y:int=0 ; y < points.length;y++){
        vertices[y] = points[y];
    }
    
    mesh.vertices = vertices;
    //mesh.uv = uvs;
    mesh.triangles = triangles; 

    mesh.RecalculateNormals();
    mesh.RecalculateBounds();
    mesh.Optimize();
    mesh.name = "InnerVisionMesh";

    //renderer.material = visionMaterial;
    filter.mesh = mesh;
    innerMesh.transform.position = new Vector3(0,0,0);
    innerMesh.GetComponent(MeshRenderer).material.color.a = 0.3f;
    innerMesh.GetComponent(MeshRenderer).sortingOrder = 2;
    

    mesh=null;
    filter = null;
    //renderer=null;
}

function TurnViewCone(direction:String){ //Changes the considered facing of the NPC after a short delay
    if(bufferDirection!=direction){
        switch(direction){
            case "up":
                iBufferVisionFacing=1;
                break;
            case "upleft":
                iBufferVisionFacing=2;
                break;
            case "upright":
                iBufferVisionFacing =0;
                break;
            case "right":
                iBufferVisionFacing =7 ;
                break;
            case "left":
                iBufferVisionFacing=3;
                break;
            case "down":
                iBufferVisionFacing=5;
                break;
            case "downright":
                iBufferVisionFacing=4;
                break;
            case "downleft":
                iBufferVisionFacing=6;
                break;
        }
        bufferUsed = true;
        bufferViewConeTimer = Time.time+0.5f;
        bufferDirection = direction;
    } 
}

function UpdateInventorySprites(){ //Changes the icon above an NPC to show what they are currently holding. This was used as part on old Inventory system.
    var bHasKey:boolean = false;
    for(var iCounter:int=0;iCounter<inventory.length;iCounter++){
        if(inventory[iCounter] == "key"){
            bHasKey=true;
        }
    }
    if(bHasKey ==true && inventoryIcon.GetComponent(SpriteRenderer).enabled == false){
        inventoryIcon.GetComponent(SpriteRenderer).sprite = blueKeySprite;
        inventoryIcon.GetComponent(SpriteRenderer).enabled = true;
    }else{
        if(inventoryIcon.GetComponent(SpriteRenderer)!=null){
            //inventoryIcon.GetComponent(SpriteRenderer).enabled = false;
        }
    }
}

function React(target:GameObject,iWaitTime:int){ //Switches the behaviour of an NPC to react to something, unless it is currently being forced to move somewhere by an ability.
    if(bForcedMove==true){
        return;
    }
    iBehaviour = 10;
    reactTarget = target;
    reactTime = iWaitTime;
}

function Shoot(target:GameObject){ //Changes the behaviour of an NPC to shoot at something.
    if(target==null){
        
        return;
    }
    if(iBehaviour!=11){
        prevBehaviour = iBehaviour;
    }
    iBehaviour = 11;
    shootTarget = target; 
}

function FinishShooting(){ //Called when the shooting animation has concluded.
    iBehaviour = prevBehaviour;
    if(shootTarget!=null){
        if(shootTarget.GetComponent(Animator)!=null && shootTarget.name != "Marceau"){ //If the target has an animator, a death animation is called
            shootTarget.GetComponent(Animator).Play("Death");
            shootTarget = null;

        }else{//If the target has no animator, the puzzle to which it belongs must remove it.
            var parentPuzzle:GameObject = shootTarget;
            var i:int = 0;
            while(parentPuzzle.GetComponent(Puzzle_Controller)==null){//This loop moves up through an objects parent hierarchy until it has found the appropriate puzzle. A counter is added to prevent an infinite loop in the case of a bug
                if(parentPuzzle.transform.parent==null || parentPuzzle.transform.parent.gameObject == null || i>10){
                    parentPuzzle=null;
                    break;
                }
                i++;
                parentPuzzle = shootTarget.transform.parent.gameObject;
            }
            if(parentPuzzle!=null){
                parentPuzzle.GetComponent(Puzzle_Controller).placeBlood(shootTarget.transform.position);
                parentPuzzle.GetComponent(Puzzle_Controller).removeChildFromList(shootTarget);
            }
            Destroy(shootTarget);
            shootTarget = null;
        }
    }
}

function BecomeDrunk(){//Called when the player uses the 'spike drink' ability. It sets a timer for the character to become knocked out.
    bDrunk = true;
    drunkTimer = Time.time+1;
}

function StopReact(){ //Returns an NPCs behaviour to the default patrol route once it has stopped reacting to something.
    iBehaviour = 2;
    if(charName=="Didier"){
        ChangeBehaviour(3);
    }
}

function NextPatrolWaypoint(route:int){ //Finds the next waypoint the NPC should be moving to once it has reached the last one. Also checks if the next waypoint should be looked at instead of moved to.
	if(route==2){
		if(iWaypointNo>=PatrolPath1.length){
			iWaypointNo=0;
		}
		if(PatrolPath1[iWaypointNo].GetComponent(PathfindingTileHandler).bLookAtPoint == false){
			Move(PatrolPath1[iWaypointNo]);
		}else{
			bTurning = true;
			TurnToFace(PatrolPath1[iWaypointNo]);
		}
    }else if(route ==3){
        if(iWaypointNo>=PatrolPath2.length){
			iWaypointNo=0;
		}
		if(PatrolPath2[iWaypointNo].GetComponent(PathfindingTileHandler).bLookAtPoint == false){
			Move(PatrolPath2[iWaypointNo]);
		}else{
			bTurning = true;
			TurnToFace(PatrolPath2[iWaypointNo]);
		}
    }
}

function ShootAt(target:GameObject){ //Similar to the "LookAt" function, but set the NPC to use the 'shoot' animations instead of 'look'
    var xDifference:float = target.transform.position.x - transform.position.x;
    var yDifference:float = target.transform.position.y - (transform.position.y/*-0.15f*/);
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
    if(angle <25 || angle >335){
        gameObject.GetComponent(SpriteRenderer).sprite = spriteBack;
        UpdateAnimation("Attack NorthWest");
        TurnViewCone("up");
		
    }else if(angle >25 && angle<65){
        gameObject.GetComponent(SpriteRenderer).sprite = spriteBackRight;
        TurnViewCone("upright");
        UpdateAnimation("Attack North");

    }else if(angle >65 && angle<115){
        gameObject.GetComponent(SpriteRenderer).sprite = spriteRight;
        TurnViewCone("right");

        UpdateAnimation("Attack NorthEast");

    }else if(angle >115 && angle<155){
        gameObject.GetComponent(SpriteRenderer).sprite = spriteFrontLeft;
        TurnViewCone("downleft");
		
        UpdateAnimation("Attack East");

    }else if(angle >155 && angle<205){
        gameObject.GetComponent(SpriteRenderer).sprite = spriteFront;
        TurnViewCone("down");
		
        UpdateAnimation("Attack SouthEast");

    }else if(angle >205 && angle<245){
        gameObject.GetComponent(SpriteRenderer).sprite = spriteFrontRight;
        TurnViewCone("downright");
		
        UpdateAnimation("Attack South");

    }else if(angle >245 && angle<295){
        gameObject.GetComponent(SpriteRenderer).sprite = spriteLeft;
        TurnViewCone("left");
		
        UpdateAnimation("Attack SouthWest");

    }else if(angle >295 && angle<335){
        gameObject.GetComponent(SpriteRenderer).sprite = spriteBackLeft;
        TurnViewCone("upleft");
        UpdateAnimation("Attack West");

    }
}

function TurnToFace(target:GameObject){ //Finds the angle between an NPC and a target to have the character face the right direction
	var xDifference:float = target.transform.position.x - transform.position.x;
	var yDifference:float = target.transform.position.y - (transform.position.y/*-0.15f*/);
	
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
	
	if(angle <25 || angle >335){
	    gameObject.GetComponent(SpriteRenderer).sprite = spriteBack;
	    
	    UpdateAnimation("LookBackStraight");

		TurnViewCone("up");
		
	}else if(angle >25 && angle<65){
		gameObject.GetComponent(SpriteRenderer).sprite = spriteBackRight;
		TurnViewCone("upright");

		UpdateAnimation("LookBackRight");

	}else if(angle >65 && angle<115){
		gameObject.GetComponent(SpriteRenderer).sprite = spriteRight;
		TurnViewCone("right");

		UpdateAnimation("LookRight");

	}else if(angle >115 && angle<155){
		gameObject.GetComponent(SpriteRenderer).sprite = spriteFrontLeft;
		TurnViewCone("downleft");
		
		UpdateAnimation("LookFrontLeft");

	}else if(angle >155 && angle<205){
		gameObject.GetComponent(SpriteRenderer).sprite = spriteFront;
		TurnViewCone("down");
		
		UpdateAnimation("LookFrontStraight");

	}else if(angle >205 && angle<245){
		gameObject.GetComponent(SpriteRenderer).sprite = spriteFrontRight;
		TurnViewCone("downright");
		
		UpdateAnimation("LookFrontRight");

	}else if(angle >245 && angle<295){
		gameObject.GetComponent(SpriteRenderer).sprite = spriteLeft;
		TurnViewCone("left");
		
		UpdateAnimation("LookLeft");

	}else if(angle >295 && angle<335){
		gameObject.GetComponent(SpriteRenderer).sprite = spriteBackLeft;
		TurnViewCone("upleft");
		
		UpdateAnimation("LookBackLeft");

	}
	if(target.GetComponent(PathfindingTileHandler).bShooting == true && target.GetComponent(PathfindingTileHandler).shootTarget!=null){//Sets the NPC to shoot a target if necessary
	    Shoot(target.GetComponent(PathfindingTileHandler).shootTarget);
	    target.GetComponent(PathfindingTileHandler).shootTarget = null;
	}else{
	    if(iBehaviour!=10){//If the current waypoint has an idle animation, play it when looking in this direction.
	        if(target.GetComponent(PathfindingTileHandler).idleAnimation.length >1 && GetComponent(Animator)!=null){
	            if(target.GetComponent(PathfindingTileHandler).idleAnimation == "LeaningDrink"){
	                if(bLeanDrinking == false){
	                    GetComponent(Animator).Play("LeaningDrink");
	                    bLeanDrinking = true;
	                }
	            }else{
	                bLeanDrinking = false;
	            }
	        }
	        if(target.GetComponent(PathfindingTileHandler).NextWaypoint()==true){//This checks to see if it is time to move on to the next waypoint, or if the NPC should continue looking this way.
	            target.GetComponent(PathfindingTileHandler).RelinquishReactive();
	            iWaypointNo++;
	            bTurning = false;
	            NextPatrolWaypoint(iBehaviour);
	        }
	    }
	}
}

public function UpdateAnimation(direction:String){ //Update animation if NPC is specifically set to playing one. 
    if(GetComponent(Animator)==null){
        return;
    }
    if(sweeping == true){
        if(bTurning == true){
            GetComponent(Animator).Play("SweepAnimation");
            return;
        }
    }
    if(bLeanDrinking==true){
        return;
    }
    GetComponent(Animator).Play(direction);
}

function Move(target:GameObject){ //This STARTS an NPCs move to a location, finding the path
    //When an NPC is told to move to a particular point, or waypoint, it is necessary to find a tile that is considered the 'start point' and then call the pathfinding function

	var startTile:GameObject;
	var closestDistance:float = 600000f;
	
	for(var child:Transform in parentPuzzle.transform){
		if(child.gameObject.tag == "walkable"){
			if((child.transform.position - transform.position).magnitude < closestDistance){
				closestDistance = (child.transform.position - transform.position).magnitude;
				startTile = child.gameObject;
			}
		}
	}
	
	Pathfind(target,startTile); //Takes the start and target tiles, and finds the shortest route between the two
	currentPath = GetPath(target,startTile);
	walkIndex = currentPath.length-1;
	bPathingDone = true;
}

function Walk(){ //This is called once the NPC has a path found by the pathfinding function, it establishes whether or not it has completed the route; and continues along the path if not. 
	if(walkIndex>=0){
		var nextWaypoint:GameObject = currentPath[walkIndex];
		if((Vector2(transform.position.x,transform.position.y/*-0.15*/)-nextWaypoint.transform.position).magnitude <0.02){
			transform.position.x = nextWaypoint.transform.position.x;
			transform.position.y = nextWaypoint.transform.position.y;
			//transform.position.y+=0.15;
			walkIndex--;
		}else{
			WalkTowards(nextWaypoint);
		}
	}else{
		var currentTarget:GameObject = currentPath[0];
		if(currentTarget.GetComponent(PathfindingTileHandler).NextWaypoint()==true){
		    if(bForcedMove==true){
		        if(currentTarget==returnSpot){
		            bForcedMove=false;
		        }
		        
		        Move(returnSpot);
		    }else{
		        currentTarget.GetComponent(PathfindingTileHandler).RelinquishReactive();
		        iWaypointNo++;
		        NextPatrolWaypoint(iBehaviour);
		    }
		}
	}
}

function WalkTowards(target:GameObject){ //Specifically moves towards the next node in a route provided by the pathfinding function, also switches the characters facing based on direction
    //Disable any idle animations
    bLeanDrinking = false;
    //--------------

	var bUp:boolean = false;
	var bDown:boolean = false;
	var bLeft:boolean = false;
	var bRight:boolean = false;
	
	var targetCartPosition:Vector2 = IsoToCart(target.transform.position);
	
	if(target.transform.position.y - (transform.position.y /*-0.15*/) >0.01){
		bUp=true;
	}
	if(target.transform.position.y - (transform.position.y /*-0.15*/) <-0.01){
		bDown= true;
	}
	if(target.transform.position.x - transform.position.x <-0.01){
		bLeft = true;
	}
	if(target.transform.position.x - transform.position.x > 0.01){
		bRight= true;
	}
	
	if(bUp==false&&bDown==false&&bRight==false&&bLeft==false){
		dX = 0;
		dY= 0;
	}
	else if(bUp==true&&bDown==false&&bRight==false&&bLeft==false){
	    gameObject.GetComponent(SpriteRenderer).sprite = spriteBack;
	    UpdateAnimation("LookBackStraight");
	    TurnViewCone("up");

		dX = 0.5f;
		dY= 0.5f;
	}
	else if(bUp==false&&bDown==true&&bRight==false&&bLeft==false){
	    gameObject.GetComponent(SpriteRenderer).sprite = spriteFront;
	    UpdateAnimation("LookFrontStraight");
	    TurnViewCone("down");

		dX = -0.5f;
		dY= -0.5f;
	}
	else if(bUp==false&&bDown==false&&bRight==true&&bLeft==false){
	    gameObject.GetComponent(SpriteRenderer).sprite = spriteRight;
	    UpdateAnimation("LookRight");
		TurnViewCone("right");
		dX = 0.25f;
		dY= -0.25f;
	}
	else if(bUp==false&&bDown==false&&bRight==false&&bLeft==true){
	    gameObject.GetComponent(SpriteRenderer).sprite = spriteLeft;
	    UpdateAnimation("LookLeft");
		TurnViewCone("left");
		dX = -0.25f;
		dY=  0.25f;
	}
	else if(bUp==true&&bDown==false&&bRight==true&&bLeft==false){
	    gameObject.GetComponent(SpriteRenderer).sprite = spriteBackRight;
	    UpdateAnimation("LookBackRight");
		TurnViewCone("upright");
		dX = 0.5f;
		dY =  0;
	}
	else if(bUp==true&&bDown==false&&bRight==false&&bLeft==true){
	    gameObject.GetComponent(SpriteRenderer).sprite = spriteBackLeft;
	    UpdateAnimation("LookBackLeft");
		TurnViewCone("upleft");
		dX = 0;
		dY = 0.5f;
	}
	else if(bUp==false&&bDown==true&&bRight==false&&bLeft==true){
	    gameObject.GetComponent(SpriteRenderer).sprite = spriteFrontRight;
	    UpdateAnimation("LookFrontRight");
		TurnViewCone("downright");
		dX = -0.5f;
		dY = 0;
	}
	else if(bUp==false&&bDown==true&&bRight==true&&bLeft==false){
	    gameObject.GetComponent(SpriteRenderer).sprite = spriteFrontLeft;
	    UpdateAnimation("LookFrontLeft");
		TurnViewCone("downleft");
		dX = 0;
		dY = -0.5f;
	}//Once the direction has been established, a check must be carried out to see if the NPC can stand in the new location.
	
	xPos += (dX*fSpeed*Time.deltaTime);
	yPos += (dY*fSpeed*Time.deltaTime);

    //The character's collision ball is moved first, this then checks for collisions: if it finds any, it simply moves back to the character, which stands still; otherwise the character is moved forwards to the new position
	var ballY:float = yPos; //- 0.1f; 
	var ballX:float = xPos; //- 0.1f;

	collisionBall.GetComponent(Transform).position = CartToIso(Vector2(ballX,ballY));
	if(collisionBall.GetComponent(CollisionBallHandler).colliding == true){
	    xPos -= (dX*fSpeed*Time.deltaTime);
	    yPos -= (dY*fSpeed*Time.deltaTime);
		collisionBall.GetComponent(Transform).position = CartToIso(Vector2(ballX,ballY));
	}else{
		gameObject.GetComponent(Transform).position.x = CartToIso(Vector2(xPos,yPos)).x;
		gameObject.GetComponent(Transform).position.y = CartToIso(Vector2(xPos,yPos)).y;
	}
}

function GetPath(target:GameObject,startPoint:GameObject):Array{ //This generates the final path taken by an NPC after the pathfinding has been evaluated. 
	var currentSelection:GameObject = target;
	var PathArray:Array = new Array();
	while(currentSelection!=startPoint){
	    PathArray.push(currentSelection);
	    currentSelection = currentSelection.GetComponent(PathfindingTileHandler).parentTile;
	    var temp:GameObject = PathArray[PathArray.length-1];
	    Debug.DrawLine(currentSelection.transform.position, temp.transform.position,Color.green,10f);
	}
	PathArray.push(startPoint);
	return PathArray;
}

function Pathfind(goal:GameObject,startPoint:GameObject){//Uses A* pathfinding algorithm to evaluate the best route to a location
	
	var closedList:Array = new Array();
	var openList:Array = new Array();
	var currentTile:GameObject  = startPoint;
	
	openList.push(startPoint);
	
	while(openList.length>0){
		var lowestScore:float = 5000f;
		var Index:int; 
		//Choose lowest scoring tile
		for(var i:int=0;i<openList.length;i++){
			var listObject:GameObject = openList[i];
			var nextScore:float = listObject.GetComponent(PathfindingTileHandler).moveToScore + listObject.GetComponent(PathfindingTileHandler).hScore;
			if(nextScore<lowestScore){
				lowestScore = nextScore;
				currentTile = listObject;
				Index = i;
			}
		}
		//--------------------
		closedList.push(currentTile);
		openList.RemoveAt(Index);
		if(currentTile == goal){
			return; 
		}
		//Add new tiles to openlist and evaluate their scores
		var newTiles:Array = currentTile.GetComponent(PathfindingTileHandler).GetAdjacentTiles();
		for(var a:int=0;a<newTiles.length;a++){
			if(InList(newTiles[a],closedList)==false){
				var waypoint:GameObject = newTiles[a];
				waypoint.GetComponent(PathfindingTileHandler).RemovePathingScores();
				var newMoveScore:float = currentTile.GetComponent(PathfindingTileHandler).moveToScore + ((waypoint.transform.position - currentTile.transform.position).magnitude);//waypoint.transform.GetChild(0).GetComponent(SpriteRenderer).bounds.size.magnitude;
				if(newMoveScore < waypoint.GetComponent(PathfindingTileHandler).moveToScore ||waypoint.GetComponent(PathfindingTileHandler).moveToScore ==0){
					waypoint.GetComponent(PathfindingTileHandler).moveToScore = newMoveScore;
					waypoint.GetComponent(PathfindingTileHandler).parentTile = currentTile; 
				}
				waypoint.GetComponent(PathfindingTileHandler).hScore = (goal.transform.position - waypoint.transform.position).magnitude;
				
				if(InList(waypoint,openList) == false){
					openList.push(newTiles[a]);
				}
			}
		}
		//---------------
	}
}

    //Sound Effect Functions---------------------

public function PlayGunshot(){
    //GameObject.Find("SoundController").GetComponent(SoundEffectController).PlayGunshot();
}


    //-------------------------------------------



function InList(item:GameObject,list:Array):boolean{//Utility function to check if a particular object is already in an array
	for(var b:int = 0; b<list.length;b++){
		if(item == list[b]){
			return true;
		}
	}
	return false;
}

function CartToIso(point:Vector2):Vector2{ //Utility function to convert a Cartesian point to its equivelant Isometric position
	var tempPoint:Vector2 = new Vector2(0,0);
	tempPoint.x = point.x - point.y;
	tempPoint.y = (point.x + point.y)/2;
	return tempPoint;
} 

function IsoToCart(point:Vector2):Vector2{ //Utility function to convert an Isometric point to its equivelant Cartesian position
	var tempPoint:Vector2 = new Vector2(0,0);
	tempPoint.x = (2 * point.y + point.x) /2;
	tempPoint.y = (2 * point.y - point.x) /2;
	return tempPoint;
}

function ToDegrees(radianAngle:float):float{ //Utility function to convert radians to degrees. 
    return radianAngle*180/Mathf.PI;
}