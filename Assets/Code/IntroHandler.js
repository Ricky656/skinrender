#pragma strict

private var spokenToMarceau:boolean;
private var spokenToMarie:boolean;
private var spokenToDidier:boolean;
private var spokenToLoup:boolean;
private var allSpokenTo:boolean;


private var bChangingMarieRoute:boolean;
private var changingMarieTimer:float;

private var bChangingMarceauRoute:boolean;
private var changingMarceauTimer:float;

private var bLoupDrinking:boolean;
private var bLoupDrinkingTimer:float;
private var bLoupRecovering:boolean;

private var bLoupBlackScreenAppearing:boolean;
private var bLoupBlackScreenShowing:boolean;

private var bBlackScreenAppearing:boolean;
private var bBlackScreenShowing:boolean;
private var fBlackScreenTimer:float;

private var bfirstCinematicStarted:boolean;

private var bI1:boolean;
private var bI1Shooting:boolean;
private var I1Timer:float;

private var bI2:boolean;
private var bI2Skinning:boolean;

private var bI3:boolean;

public var BlackScreen:GameObject;
public var title:GameObject;


//THIS CLASS HANDLES THE INTRODUCTION SECTION

function Start () {
    BlackScreen.GetComponent(SpriteRenderer).color.a =0f;
    BlackScreen.GetComponent(SpriteRenderer).enabled = true;
    title.GetComponent(SpriteRenderer).sortingOrder = 500;
    title.GetComponent(SpriteRenderer).color.a=0f; 
}

function Update () {//The update function is mainly used to keep track of timers and to cause things to fade in and out over time.

    //Marie Event
    if(bChangingMarieRoute==true && Time.time >=changingMarieTimer){
        bChangingMarieRoute = false;
        GameObject.Find("Marie").GetComponent(EnemyController).ChangeBehaviour(3);
        GameObject.Find("Marie").GetComponent(EnemyController).sweeping = false;
    }
    //----------
    //Loup Event
    if(bLoupDrinking==true && Time.time>bLoupDrinkingTimer){
        bLoupBlackScreenAppearing=true;
        bLoupDrinking = false;
    }else if(bLoupBlackScreenAppearing==true){
        if(BlackScreen.GetComponent(SpriteRenderer).color.a<1){
            BlackScreen.GetComponent(SpriteRenderer).color.a +=0.05f;
        }else{
            bLoupBlackScreenAppearing = false;
            bLoupBlackScreenShowing = true;
            bLoupDrinkingTimer = Time.time +6;
        }
    }else if(bLoupBlackScreenShowing==true){
        if(Time.time >= bLoupDrinkingTimer){
            if(BlackScreen.GetComponent(SpriteRenderer).color.a >0){
                BlackScreen.GetComponent(SpriteRenderer).color.a -= 0.025f; 
            }else{
                bLoupBlackScreenShowing = false;
                WakeUpFromDrinking();
            }
        }
    }else if(bLoupRecovering == true && Time.time >=bLoupDrinkingTimer){
        if(spokenToMarceau==true && spokenToMarie==true && spokenToDidier==true && spokenToLoup==true){
            AllSpokenTo();
        }
        bLoupRecovering = false;
    }
    //-------------------------
    //Marceau Event
    if(bChangingMarceauRoute==true && Time.time >= changingMarceauTimer){
        bChangingMarceauRoute = false;
        GameObject.Find("Marceau").GetComponent(EnemyController).ChangeBehaviour(3);
        GameObject.Find("introDoor1").GetComponent(DoorController).RequiresKey=false;
    }
    //-------------------------
    //End of Bar area cinematic
    if(bI1 == true){
        if(bBlackScreenAppearing == true){
            if(BlackScreenFinishedAppearing(0.05f)==true){
                bBlackScreenAppearing = false;
                bBlackScreenShowing = true;
                fBlackScreenTimer = Time.time+3;
                //MOVE CHARACTER AND SETUP NEXT SECTION
                GameObject.Find("Player_Character").GetComponent(Player_Controller).bMovementLocked = true;
                GameObject.Find("Player_Character").GetComponent(Player_Controller).ChangePosition(new Vector2(-0.93,2.028));
                GameObject.Find("Player_Character").GetComponent(Player_Controller).ChangeSprite("BackRight");
                GameObject.Find("GameController").GetComponent(GameController).bCameraEnabled = false;
                GameObject.Find("GameController").GetComponent(GameController).bCameraLocked = true;
                GameObject.Find("GameController").GetComponent(GameController).SetWaypoint(2);
            }
        }else if(bBlackScreenShowing == true){
            if(Time.time>=fBlackScreenTimer){
                if(BlackScreenFinishedDisappearing(0.025f) == true){
                    bI1Shooting = true;
                    bBlackScreenShowing = false;
                    var secondStageConversation1:Conversation = new Conversation();
                    secondStageConversation1.person1 = GameObject.Find("Jean Babtiste");
                    secondStageConversation1.person2 = GameObject.Find("Marceau");
                    secondStageConversation1.speech1 = new String[2];
                    secondStageConversation1.speech2 = new String[1];
                    secondStageConversation1.speech1[0] = "You have been discovered harbouring Vendean rebels, \nand aiding in the insurgency!";
                    secondStageConversation1.speech2[0] = "We don't know anything about that, we're just an Inn!";
                    secondStageConversation1.speech1[1] = "An Inn that caters to the enemy, apparently.\n Shoot him! No-one talks back to me.";
                    GameObject.Find("UIController").GetComponent(UI_Controller).ShowConversation(secondStageConversation1,true);
                    I1Timer = Time.time + 28;
                    GameObject.Find("MarceausKiller").GetComponent(EnemyController).ChangeBehaviour(3);
                }
            }
        }else if(bI1Shooting == true){
            if(Time.time>=I1Timer){
                bI1Shooting = false;
                GameObject.Find("Jean Babtiste").GetComponent(EnemyController).ChangeBehaviour(3);
                var secondStageConversation2:Conversation = new Conversation();
                secondStageConversation2.person1 = GameObject.Find("Jean Babtiste");
                secondStageConversation2.speech1 = new String[1];
                secondStageConversation2.speech1[0] = "As for you, Innkeep, your death will have to \nserve as a warning to all who support this pathetic rebellion!";
                GameObject.Find("UIController").GetComponent(UI_Controller).ShowConversation(secondStageConversation2,true);

                I1Timer = Time.time +8;
            }
        }else if(Time.time >=I1Timer){
            bI1 = false;
            bI2 = true;
            bBlackScreenAppearing = true;
        }
    }
    //-------------------------
    //End of the outside street cinematic
    if(bI2 == true){
        if(bBlackScreenAppearing == true){
            if(BlackScreenFinishedAppearing(0.05f) == true){
                bBlackScreenAppearing = false;
                bBlackScreenShowing = true;
                fBlackScreenTimer = Time.time +3;
                //MOVE CHARACTER AND SETUP NEXT SECTION
                GameObject.Find("Player_Character").GetComponent(Player_Controller).ChangePosition(new Vector2(-24.8,5.31));
                GameObject.Find("Player_Character").GetComponent(Player_Controller).ChangeSprite("FrontLeft");
                GameObject.Find("GameController").GetComponent(GameController).SetWaypoint(2);
            }
        }else if(bBlackScreenShowing==true){
            if(Time.time>=fBlackScreenTimer){
                if(BlackScreenFinishedDisappearing(0.025f)==true){
                    bBlackScreenShowing = false;

                    var thirdStageConversation1:Conversation = new Conversation();
                    thirdStageConversation1.person1 = GameObject.Find("Jean Babtiste");
                    thirdStageConversation1.speech1 = new String[2];
                    thirdStageConversation1.speech2 = new String[1];
                    thirdStageConversation1.speech1[0] = "For the crimes of treason against the state. This man\nSebastien Everard, shall be sentenced to death by flaying. \nHis skin shall serve as a warning to all who think of\ncommiting such villainous acts.";
                    thirdStageConversation1.speech2[0] = "This Inn shall be used to serve the Republican army \nand aid its efforts to stamp out Vendean rabble from the area!";
                    thirdStageConversation1.speech1[1] = "...Skin him.";
                    GameObject.Find("UIController").GetComponent(UI_Controller).ShowConversation(thirdStageConversation1,true);
                    I1Timer = Time.time + 18;
                    bI2Skinning = true;
                }
            }
        }else if(bI2Skinning == true){
            if(Time.time>=I1Timer){
                bI2Skinning = false;
                bI3=true;
                bI2 =false;
                bBlackScreenAppearing=true;
                for(var iCounter:int=0;iCounter<GameObject.Find("IntroArea3(Clone)").transform.childCount;iCounter++){
                    if(GameObject.Find("IntroArea3(Clone)").transform.GetChild(iCounter).gameObject.tag == "enemy"){
                        GameObject.Find("IntroArea3(Clone)").transform.GetChild(iCounter).gameObject.GetComponent(EnemyController).ChangeBehaviour(3);
                    }
                }
            }
        }
    }else if(bI3==true){
        if(bBlackScreenAppearing == true){
            if(BlackScreenFinishedAppearing(0.004f)){
                bBlackScreenShowing = true;
                bBlackScreenAppearing = false;
            }
        }else if(bBlackScreenShowing==true){
            if(title.GetComponent(SpriteRenderer).color.a <1){
                title.GetComponent(SpriteRenderer).color.a += 0.001f;
            }else{
                GameObject.Find("Player_Character").GetComponent(Player_Controller).currentSpriteSet = "Skinrender";
                GameObject.Find("Player_Character").GetComponent(Player_Controller).ChangeSprite("FrontLeft");
                GameObject.Find("GameController").GetComponent(GameController).StartGame();
                bBlackScreenShowing = false;
            }
        }else{
            title.GetComponent(SpriteRenderer).color.a -= 0.025f;
            if(BlackScreenFinishedDisappearing(0.025f)==true){
                bI3 = false;
                GameObject.Find("Player_Character").GetComponent(Player_Controller).bMovementLocked = false;
                GameObject.Find("Player_Character").GetComponent(Player_Controller).bMovementEnabled = true;
                GameObject.Find("GameController").GetComponent(GameController).bCameraLocked = false;
                GameObject.Find("GameController").GetComponent(GameController).bCameraEnabled = true;
                GameObject.Find("GameController").GetComponent(GameController).SetWaypoint(4);
            }
        }
    }
    //-------------------------
}

private function BlackScreenFinishedAppearing(speed:float):boolean{//Function called to cause the blackout overlay to appear
    if(BlackScreen.GetComponent(SpriteRenderer).color.a <1){
        BlackScreen.GetComponent(SpriteRenderer).color.a +=speed;
    }else{
        return true;
    }
    return false;
}

private function BlackScreenFinishedDisappearing(speed:float):boolean{//Function called to cause the blackout overlay to disappear. 
    if(BlackScreen.GetComponent(SpriteRenderer).color.a >0){
        BlackScreen.GetComponent(SpriteRenderer).color.a -=speed;
    }else{
        return true;
    }
    return false;
}

private function WakeUpFromDrinking(){ //Function wakes up the player after experiencing the 'spike drink' ability once they've talked to Loup twice. 
    GameObject.Find("Player_Character").GetComponent(Player_Controller).bMovementLocked = false;
    bLoupRecovering=true;
    bLoupDrinkingTimer = Time.time + 4;
    GameObject.Find("GameController").GetComponent(GameController).DisplayUIMessage("Wow, that stuff IS strong! Knocked me out cold");
}

public function SpokenTo(name:String){ //This function is used to keep track of which characters the Player speaks to.
    switch(name){
        case "Marceau":
            if(allSpokenTo==true){
                bChangingMarceauRoute = true;
                changingMarceauTimer = Time.time+8;
            }
            spokenToMarceau = true;
            break;
        case "Marie":
            if(spokenToMarie==true){
                bChangingMarieRoute = true;
                changingMarieTimer = Time.time +8;
                spokenToDidier = true;
                var newMessage:Conversation = new Conversation();
                newMessage.speech1 = new String[1];
                newMessage.person1 = GameObject.Find("Didier");
                newMessage.speech1[0] = "I'll catch up with you a bit later, Sebastien!";
                GameObject.Find("Didier").GetComponent(EnemyController).conversationLocked=true;
                GameObject.Find("Didier").GetComponent(EnemyController).conversationIndex=0;
                GameObject.Find("Didier").GetComponent(EnemyController).conversations = new Array();
                GameObject.Find("Didier").GetComponent(EnemyController).conversations.push(newMessage);

                newMessage = new Conversation();
                newMessage.speech1 = new String[1];
                newMessage.person1 = GameObject.Find("Loup_Bartender");
                newMessage.speech1[0] = "Sebastien! That was a great night! \nYour Inn has really come together. \nI bet you and Liz are so proud.";
                GameObject.Find("Marceau").GetComponent(EnemyController).conversations[0] = newMessage;
            }else{
                spokenToMarie = true;
            }
            break;
        case "Didier":
            spokenToDidier = true;
            break;
        case "Loup":
            if(spokenToLoup==true){
                bLoupDrinking = true;
                bLoupDrinkingTimer = Time.time +15;
                GameObject.Find("Player_Character").GetComponent(Player_Controller).bMovementLocked = true;
            }else{
                spokenToLoup = true;
            }
            break;
    }
    if(spokenToMarceau==true && spokenToMarie==true && spokenToDidier==true && spokenToLoup==true && allSpokenTo== false){
        AllSpokenTo();
        allSpokenTo = true;
    }
}

function AllSpokenTo(){ //Once every character has been spoken to, the conversations are all changed so the next section can begin. 
    var warningMessage:Conversation = new Conversation();
    warningMessage.speech1 = new String[1];
    warningMessage.person1 = GameObject.Find("Marceau");
    warningMessage.speech1[0] = "Sebastien! Come over here, \nI can hear something outside!";
    GameObject.Find("UIController").GetComponent(UI_Controller).ShowConversation(warningMessage,false);
    //GameObject.Find("GameController").GetComponent(GameController).PanCamera(new Vector3(0.3,0.08,0),true);

    warningMessage = new Conversation();
    warningMessage.speech1 = new String[1];
    warningMessage.speech1[0] = "You should see what Marceau wants, \nit sounds important. He's still by the door.";

    GameObject.Find("Marie").GetComponent(EnemyController).conversationLocked=true;
    GameObject.Find("Marie").GetComponent(EnemyController).conversationIndex=0;
    GameObject.Find("Marie").GetComponent(EnemyController).conversations = new Array();
    GameObject.Find("Marie").GetComponent(EnemyController).conversations.push(warningMessage);

    GameObject.Find("Didier").GetComponent(EnemyController).conversationLocked=true;
    GameObject.Find("Didier").GetComponent(EnemyController).conversationIndex=0;
    GameObject.Find("Didier").GetComponent(EnemyController).conversations = new Array();
    GameObject.Find("Didier").GetComponent(EnemyController).conversations.push(warningMessage);

    GameObject.Find("Loup_Bartender").GetComponent(EnemyController).conversationLocked=true;
    GameObject.Find("Loup_Bartender").GetComponent(EnemyController).conversationIndex=0;
    GameObject.Find("Loup_Bartender").GetComponent(EnemyController).conversations = new Array();
    GameObject.Find("Loup_Bartender").GetComponent(EnemyController).conversations.push(warningMessage);


    warningMessage = new Conversation();
    warningMessage.speech1 = new String[1];
    warningMessage.person1 = GameObject.Find("Marceau");
    warningMessage.speech1[0] = "I heard something outside. I think it was fighting! \nLet's make sure everything's okay.";
    GameObject.Find("Marceau").GetComponent(EnemyController).conversationLocked=false;
    GameObject.Find("Marceau").GetComponent(EnemyController).conversationIndex=0;
    GameObject.Find("Marceau").GetComponent(EnemyController).conversations = new Array();
    GameObject.Find("Marceau").GetComponent(EnemyController).conversations.push(warningMessage);

}

public function CinematicCollision(cinematicID:String){//This is used to allow sections to only begin once the player steps onto colliders. 
    switch (cinematicID){
        case "i1":
            if(bfirstCinematicStarted==false){
                bI1 = true;
                bBlackScreenAppearing = true;
            }
            bfirstCinematicStarted = true;
            break;
    }
}