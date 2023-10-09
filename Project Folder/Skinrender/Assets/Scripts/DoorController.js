#pragma strict

public var RequiresKey:boolean;
public var openDoorSprite:Sprite;
public var closedDoorSprite:Sprite;
private var numberOfCollisions:int;
public var lockedDoorSprite:Sprite;

function Start () {
    numberOfCollisions = 0;
}

function Update () {

}

function OnCollisionEnter2D(col:Collision2D){
    numberOfCollisions++;
    if(RequiresKey==false || col.collider.gameObject.tag !="Player"){ //Opens the door if it is either unlocked, or if an NPC is trying to get through (NPCs are always allowed through locked doors)
        OpenDoor();
    }else{
        switch (col.collider.gameObject.tag){//A now-unused system of character inventories was used to open doors previously, this was replaced by a simpler system managed by the Puzzle_Controller class.
            case "Player":
                /*var tempInventoryArray:Array = col.collider.gameObject.GetComponent(CollisionBallHandler).GetPlayerInventory();
                for(var x:int =0; x<tempInventoryArray.length;x++){
                    var tempItem:String = tempInventoryArray[x];
                    if(tempItem == "key"){
                        OpenDoor();
                        col.collider.gameObject.GetComponent(Player_Controller).inventory.RemoveAt(x);
                    }
                }*/
                break;
        }
    }
}

function OnCollisionExit2D(col:Collision2D){
    numberOfCollisions--; //This function closes the door when all characters have passed through it
    if(numberOfCollisions==0){
        CloseDoor();
    }
}

//These functions enabled/disable the collider and set the door's sprite to show it opening or closing.
function OpenDoor(){
    transform.Find("low").GetComponent(Collider2D).enabled = false;
    transform.Find("door").GetComponent(SpriteRenderer).sprite = openDoorSprite;
}

function CloseDoor(){
    transform.Find("low").GetComponent(Collider2D).enabled = true;
    transform.Find("door").GetComponent(SpriteRenderer).sprite = closedDoorSprite;
}

public function UnlockDoor(){
    RequiresKey = false;
    transform.Find("door").GetComponent(SpriteRenderer).sprite = closedDoorSprite;
}