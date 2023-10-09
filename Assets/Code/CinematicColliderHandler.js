#pragma strict

public var cinematicID:String;
public var playerActivated:boolean;

//This class is used to trigger cinematic events when a character collides with the object

function OnCollisionEnter2D(col:Collision2D)
{
    if(playerActivated==true){//These cinematic colliders can be set to be activated by the player or an NPC 
        if(col.collider.gameObject.tag== "Player"){
            Activate();
        }
    }else{
        if(col.collider.gameObject.tag != "Player"){
            Activate();
        }
    }
}

function Activate(){
    GameObject.Find("GameController").GetComponent(GameController).CinematicCollision(cinematicID);
}