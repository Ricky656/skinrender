#pragma strict

public var MessageField:GameObject;
public var MessageOutline:GameObject;

public var conversationField1:GameObject;
public var conversationField2:GameObject;

public var conversationBacking1:GameObject;
public var conversationBacking2:GameObject;

private var currentConversation:Conversation;
private var conversationIndex1:int;
private var conversationIndex2:int; 

private var conversationFocus:boolean;
public var conversationShowing:boolean;
private var conversationBuffer:Array;
private var conversationBusy:boolean;
private var conversationTextAppearing:boolean;
private var conversationTextShowing:boolean;
private var conversationTextTime:float;

public var UIBack:GameObject;
public var UIBlood:GameObject;
public var UIEye:GameObject;

public var ClosedEye:Sprite;
public var OpenEye:Sprite;

public var skinrenderSkin:Sprite;
public var republicanSkin:Sprite;

private var bMessageAppearing:boolean;
private var bMessageShowing:boolean;
private var bMessageDisappearing:boolean;
private var bMessageTime:float;

private var bDisguised:boolean;
private var bBloodTimer:float;

private var bBusy:boolean;

private var MessageBuffer:Array;

private var currentState:int;
private var fBloodTimeLeft:float;

public var conversationBubble1:GameObject;
public var conversationBubble2:GameObject;

function Start () { //Sets up UI elements initial positions
    MessageField.GetComponent(Renderer).material.color.a=0f;
    MessageOutline.GetComponent(Renderer).material.color.a=0f;
    conversationField1.GetComponent(Renderer).material.color.a = 0f;
    conversationField2.GetComponent(Renderer).material.color.a = 0f;
    conversationBacking1.GetComponent(Renderer).material.color.a = 0f;
    conversationBacking2.GetComponent(Renderer).material.color.a = 0f; 
    
    conversationBuffer = new Array();
    MessageBuffer = new Array();
    UIBlood.transform.localScale.y=0f;
    currentState = GameState.Playing;

    MessageField.GetComponent(Renderer).sortingOrder = 200;
    MessageOutline.GetComponent(Renderer).sortingOrder = 199;
    conversationField1.GetComponent(Renderer).sortingOrder = 200;
    conversationField2.GetComponent(Renderer).sortingOrder = 200;
    conversationBacking1.GetComponent(Renderer).sortingOrder = 199;
    conversationBacking2.GetComponent(Renderer).sortingOrder = 199;

    UIBack.GetComponent(SpriteRenderer).sortingOrder = 200;
    UIBlood.GetComponent(SpriteRenderer).sortingOrder =198;
    UIEye.GetComponent(SpriteRenderer).sortingOrder = 202;
    transform.Find("UISkin").GetComponent(SpriteRenderer).sortingOrder = 201;
    transform.Find("BG").GetComponent(SpriteRenderer).sortingOrder = 199;

    conversationBubble1.GetComponent(SpriteRenderer).color.a = 0f;
    conversationBubble2.GetComponent(SpriteRenderer).color.a = 0f;
    conversationBubble1.GetComponent(SpriteRenderer).sortingOrder = 100;
    conversationBubble2.GetComponent(SpriteRenderer).sortingOrder = 100;

    /*var tempConversation:Conversation = new Conversation();
    tempConversation.speech1 = new String[2];
    tempConversation.speech2 = new String[2];
    tempConversation.speech1[0] = "This is a test with many a long words to see how it would work";
    tempConversation.speech1[1] = "a cool test!";
    tempConversation.speech2[0] = "I am equally interested in how it functions with regards to length";
    tempConversation.speech2[1] = "I can confirm this!";
    ShowConversation(tempConversation);*/
}

function Update () {//Updates UI elements 
    if(currentState==GameState.Playing){
        HandleBlood();
        HandleConversation();
    }
    HandleMessages();
}

public function HideUI(){ //Hides the disguise element
    UIBlood.GetComponent(SpriteRenderer).enabled = false;
    UIBack.GetComponent(SpriteRenderer).enabled = false;
}

public function ShowUI(){//Unhides the disguise element
    UIBlood.GetComponent(SpriteRenderer).enabled = true;
    UIBack.GetComponent(SpriteRenderer).enabled = true;
}

public function Pause(){//Pause the timers
    fBloodTimeLeft = bBloodTimer - Time.time;
    currentState = GameState.Paused;
}

public function UnPause(){//Unpause timers
    bBloodTimer = Time.time + fBloodTimeLeft;
    currentState = GameState.Playing;
}

function StartBloodTimer(disguise:String){//Start the disguise timer to show how long until the disguise will fall off the player character
    UIBlood.transform.localScale.y=1f;
    bDisguised = true;
    bBloodTimer = Time.time+0.6f;
    if(disguise=="guard"){
        transform.Find("UISkin").GetComponent(SpriteRenderer).sprite = republicanSkin;
    }
}

function Visibility(open:boolean){//A now redundant function previously used as part of the shadow mechanic to indicate if the player character can currently be seen
    if(open==true){
        UIEye.GetComponent(SpriteRenderer).sprite = OpenEye;
    }else{
        UIEye.GetComponent(SpriteRenderer).sprite = ClosedEye;
    }
}

public function SkipMessage(){ //Called when the player wants to skip a single message in a conversation
    if(conversationFocus==false){
        if(conversationTextAppearing==true){
            conversationField1.GetComponent(Renderer).material.color.a =0.995f;
            conversationBacking1.GetComponent(Renderer).material.color.a = 0.995f;
        }else{
            conversationField1.GetComponent(Renderer).material.color.a =0.1f;
            conversationBacking1.GetComponent(Renderer).material.color.a = 0.1f; 
        }
    }else{
        if(conversationTextAppearing==true){
            conversationField2.GetComponent(Renderer).material.color.a =0.995f;
            conversationBacking2.GetComponent(Renderer).material.color.a = 0.995f;
        }else{
            conversationField2.GetComponent(Renderer).material.color.a =0.1f;
            conversationBacking2.GetComponent(Renderer).material.color.a = 0.1f; 
        }
    }
    conversationTextTime = Time.time;
}

public function ShowConversation(newConversation:Conversation, lockMovement:boolean){//This function sets up a conversation to be shown on screen
    if(conversationShowing==false){
        if(newConversation.person1!=null){
            conversationBubble1.transform.position = newConversation.person1.transform.position + new Vector2(0.13,0.45);
        }
        if(newConversation.person2!=null){
            conversationBubble2.transform.position = newConversation.person2.transform.position + new Vector2(0.13,0.45);
        }
        conversationBubble1.GetComponent(SpriteRenderer).color.a = 1f;
        conversationBubble2.GetComponent(SpriteRenderer).color.a = 1f;

        if(lockMovement==true){
            GameObject.Find("Player_Character").GetComponent(Player_Controller).bMovementEnabled = false;
        }
        currentConversation = newConversation;
        conversationIndex1=0;
        conversationIndex2=0;
    
        if(currentConversation.startingSpeaker == 0){
            conversationField1.GetComponent(TextMesh).text = currentConversation.speech1[conversationIndex1];
            conversationBacking1.GetComponent(TextMesh).text = currentConversation.speech1[conversationIndex1];
            conversationIndex1++;
            conversationFocus = false;
        }else{
            conversationField2.GetComponent(TextMesh).text = currentConversation.speech2[conversationIndex2];
            conversationBacking2.GetComponent(TextMesh).text = currentConversation.speech2[conversationIndex2];
            conversationIndex2++;
            conversationFocus = true;
        }
        conversationShowing = true;
        conversationTextAppearing = true;
    }else{
        conversationBuffer.Push(newConversation);
    }
}

private function HandleConversation(){//Updates throughout a conversation to show each individual message, causing them to appear and disappear over time. 
    if(conversationShowing==true){
        if(conversationTextAppearing==true){
            if(conversationFocus == false){
                if(conversationField1.GetComponent(Renderer).material.color.a <1){
                    conversationField1.GetComponent(Renderer).material.color.a +=0.05f;
                    conversationBacking1.GetComponent(Renderer).material.color.a +=0.05f;
                }else{
                    conversationTextShowing = true;
                    conversationTextAppearing = false;
                    conversationTextTime = Time.time + 8; 
                }
            }else{
                if(conversationField2.GetComponent(Renderer).material.color.a <1){
                    conversationField2.GetComponent(Renderer).material.color.a +=0.05f;
                    conversationBacking2.GetComponent(Renderer).material.color.a +=0.05f;
                }else{
                    conversationTextShowing = true;
                    conversationTextAppearing = false;
                    conversationTextTime = Time.time + 8; 
                }
            }
        }else if(conversationTextShowing==true){
            if(Time.time >= conversationTextTime){
                conversationTextShowing = false;
            }
        }else{
            var NextText:String = null;
            if(conversationFocus == false){
                if(conversationField1.GetComponent(Renderer).material.color.a >0){
                    conversationField1.GetComponent(Renderer).material.color.a -= 0.1f;
                    conversationBacking1.GetComponent(Renderer).material.color.a -=0.1f;
                }else{
                    conversationFocus = true;
                    NextText = GetNextConversationText();
                    if(NextText!=null){
                        conversationField2.GetComponent(TextMesh).text = NextText;
                        conversationBacking2.GetComponent(TextMesh).text = NextText;
                        conversationTextAppearing = true;
                    }else{
                        conversationShowing = false;
                        GameObject.Find("Player_Character").GetComponent(Player_Controller).bMovementEnabled = true;
                    }
                }
            }else{
                if(conversationField2.GetComponent(Renderer).material.color.a >0){
                    conversationField2.GetComponent(Renderer).material.color.a -= 0.1f;
                    conversationBacking2.GetComponent(Renderer).material.color.a -=0.1f;
                }else{
                    conversationFocus = false;
                    NextText = GetNextConversationText();
                    if(NextText!=null){
                        conversationField1.GetComponent(TextMesh).text = NextText;
                        conversationBacking1.GetComponent(TextMesh).text = NextText;
                        conversationTextAppearing = true;
                    }else{
                        conversationBubble1.GetComponent(SpriteRenderer).color.a = 0f;
                        conversationBubble2.GetComponent(SpriteRenderer).color.a = 0f;

                        conversationShowing = false;
                        GameObject.Find("Player_Character").GetComponent(Player_Controller).bMovementEnabled = true;
                    }
                }
            }
        }
    }else{
        if(conversationBubble1.GetComponent(SpriteRenderer).color.a != 0f){
            conversationBubble1.GetComponent(SpriteRenderer).color.a = 0f;
            conversationBubble2.GetComponent(SpriteRenderer).color.a = 0f;
        }
        if(conversationBuffer.length>0){
            ShowConversation(conversationBuffer[0],false);
            conversationBuffer.RemoveAt(0);
        }
    }
}

private function GetNextConversationText():String{//Checks to see if there is another message in a conversation
    var output:String = null;
    if(conversationFocus == false){
        if(currentConversation.speech1 !=null){
            if(conversationIndex1<currentConversation.speech1.length){
                output = currentConversation.speech1[conversationIndex1];
                conversationIndex1++;
            }
        }
    }else{
        if(currentConversation.speech2!=null){
            if(conversationIndex2<currentConversation.speech2.length){
                output = currentConversation.speech2[conversationIndex2];
                conversationIndex2++;
            }
        }
    }
    return output;
}

function ShowMessage(text:String){ //Shows a one-time message
    if(bBusy == false){
        MessageField.GetComponent(TextMesh).text = text;
        MessageOutline.GetComponent(TextMesh).text = text;
        bMessageAppearing=true;
        bBusy = true;
    }else{//These messages are not allowed to be queued up, as they could be repeated an infinite amount if the player spams buttons
        if(text!="I don't need to go back that way..." && text!= "That person doesn't seem to be listening." && text!= "That person can't get here." && text != "Select a lower-ranking person to call over." && text !="Cannot send someone there." && text!= "(You can press Escape to cancel)"){
            MessageBuffer.push(text);//If a message is to be displayed when one already is, then add it to the buffer to be displayed afterwards. 
        }
    }
}

function HandleBlood(){//Updates the blood UI element to show how much longer the player has before their disguise falls off their character.
    if(bDisguised == true){
        if(Time.time>=bBloodTimer){
            UIBlood.transform.localScale.y -=0.1f;
            bBloodTimer = Time.time+1f;//0.8f
            if(UIBlood.transform.localScale.y<=0){
                transform.Find("UISkin").GetComponent(SpriteRenderer).sprite = skinrenderSkin;
                bDisguised = false;
            }
        }
    }
}

function HandleMessages(){ //Updates the one-time messages, causing them to appear and disappear over time.
    if(bMessageAppearing == true){
        if( MessageField.GetComponent(Renderer).material.color.a<1)
        {
            MessageField.GetComponent(Renderer).material.color.a += 0.05f;
            MessageOutline.GetComponent(Renderer).material.color.a += 0.05f;
        }else{
            bMessageAppearing = false;
            bMessageShowing = true;
            bMessageTime = Time.time + 4;//6
        }
    }else if(bMessageShowing == true){
        if(Time.time>= bMessageTime){
            bMessageDisappearing = true;
            bMessageShowing = false;
        }
    }else if(bMessageDisappearing==true){
        if(MessageField.GetComponent(Renderer).material.color.a >0){
            MessageField.GetComponent(Renderer).material.color.a -= 0.05f;
            MessageOutline.GetComponent(Renderer).material.color.a -= 0.05f;
        }else{
            bMessageDisappearing = false;
            // bBusy=false;
        }
    }else{
        bBusy = false;
        if(MessageBuffer.length>0){//Setup to show the next message that has been buffered if there is one.
            var temp:String = MessageBuffer[0];
            ShowMessage(temp);
            MessageBuffer.RemoveAt(0);
        }  
    }
}