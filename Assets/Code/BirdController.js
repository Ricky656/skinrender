#pragma strict

private var playerReference:GameObject;

private var flying:boolean;

public var direction:String;

public var southSprite:Sprite;
public var northSprite:Sprite;

//This script handles the animations of the Crows that appear around the outdoor areas of the game

function Start () {
    playerReference = GameObject.Find("Player_Character");

    if(direction==null || direction == ""){//If the facing of the crow is not directly specified, a direction is chosen at random
        var iDice:int = Random.Range(0,2);
        if(iDice==0){
            direction = "north";
            GetComponent(Animator).Play("Crow Idle North");
            GetComponent(SpriteRenderer).sprite = northSprite;
        }else{
            direction = "south";
            GetComponent(Animator).Play("Crow Peck South");
            GetComponent(SpriteRenderer).sprite = southSprite;
        }
    }
}

function Update () {//If the player gets close enough, the crow switches animation and flies away
    var distanceToPlayer:float = (playerReference.transform.position - transform.position).magnitude;
    if(distanceToPlayer < 0.5f && flying == false){
        flying=true;
        if(GetComponent(Animator)!=null){
            if(direction == "north"){
                GetComponent(Animator).Play("Crow Flight North");
            }else{
                GetComponent(Animator).Play("Crow Flight South");
            }
            
        }
    }

    if(flying == false){
        var iDice:int = Random.Range(0,20); //This ensures the crow is more realistic, and not constantly pecking at a consistent rate
        if(iDice==5){
            if(direction=="north"){
                GetComponent(Animator).Play("Crow Peck North");
            }else{
                GetComponent(Animator).Play("Crow Peck South");
            }
            
        }
    }
}

function Destroy(){//Called at the end of the 'flight' animations
    gameObject.SetActive(false);
}