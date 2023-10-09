#pragma strict

public var colliding:boolean;
public var iHidden:int;
public var iVisible:int;
public var iDisguised:int;
public var iColliding:int;

//This class is used as the hitbox of characters, as the game is Isometric it is necessary to track a character's position by placing this small object at their feet.

function Start () {
	colliding = false;
}

function Update () {
	if(transform.parent.gameObject.tag == "Player"){//This allows the player character to hide in Shadows. - A mechanic added early to the game that was removed after various iteration and feedback.
		if(iHidden>0){
			transform.parent.gameObject.GetComponent(Player_Controller).Hide();
		}else{
			transform.parent.gameObject.GetComponent(Player_Controller).UnHide();
		}
	}
}

function Reset(){//Resets player character variables when puzzles are reset
    colliding = false;
    iColliding = 0;
	iHidden =0;
	iVisible=0;
	iDisguised=0;
}

/*function GetPlayerInventory():Array{ //This would have been part of an system where keys could be traded around characters in a puzzle, this was simplified to just unlocking the next door when the puzzle is complete.

}*/

function OnCollisionEnter2D(col:Collision2D){
	switch (col.collider.gameObject.tag){
		case "blocker": //This allows characters to properly collide and be stopped by obstacles in the world, such as walls or tables.
		    colliding = true;
		    iColliding++;
		    if(col.collider.gameObject.name == "entranceBlocker"){ //Entrance blockers prevents characters from going 'out of bounds' or, more commonly, back into a complete puzzle.
		        GameObject.Find("GameController").GetComponent(GameController).DisplayUIMessage("I don't need to go back that way...");
		    }
			break;
		case "shadow"://This is part of the initial 'shadows' mechanic
			iHidden++;
			iVisible = 0;
			break;
	    case "enemyVision": //This was previously used to tell when the player was visible to the enemy, this became redundant when the new 'dynamic vision' system was created
            //The colour of the enemy vision was altered when the player was colliding with it so that a player could tell they were visible, and had a small amount of time to react.

		    /*if(transform.parent.gameObject.tag == "Player" && iHidden==0 && iDisguised==0 && col.collider.gameObject.transform.parent != null ){
				iVisible=1;
				col.collider.gameObject.transform.parent.Find("ViewVector").GetComponent(SpriteRenderer).color.r +=0.05f;
				col.collider.gameObject.transform.parent.Find("ViewVector").GetComponent(SpriteRenderer).color.g -=0.05f;
				col.collider.gameObject.transform.parent.Find("ViewVector").GetComponent(SpriteRenderer).color.b -=0.05f;
			}*/
			break;
		case "checkpoint"://Checks for when the player reaches a checkpoint
			if(transform.parent.gameObject.name == "Player_Character"){
				transform.parent.GetComponent(Player_Controller).SetWaypoint(col.collider.gameObject.GetComponent(CheckpointControl).PuzzleID);
			}
			break;
	}
}

function OnCollisionExit2D(col:Collision2D){
	switch (col.collider.gameObject.tag){
		case "blocker"://Allows characters to stop colliding with objects
		    colliding = false;
		    iColliding--;
			break;
		case "shadow"://Part of the old shadow mechanic
			iHidden--;
			break;
	    case "enemyVision"://This was previously used to tell when the player had left enemy vision, this became redundant when the new 'dynamic vision' system was created

			/*if(transform.parent.gameObject.tag == "Player" && iHidden==0  && col.collider.gameObject.transform.parent != null){
				iVisible=0;
				col.collider.gameObject.transform.parent.Find("ViewVector").GetComponent(SpriteRenderer).color.r =1f;
				col.collider.gameObject.transform.parent.Find("ViewVector").GetComponent(SpriteRenderer).color.g =1f;
				col.collider.gameObject.transform.parent.Find("ViewVector").GetComponent(SpriteRenderer).color.b =1f;
			}*/
			break;
	}
}