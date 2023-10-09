#pragma strict

function OnCollisionExit2D(col:Collision2D)//Class used to create pause switches for the player to collide with
{
    if(col.collider.gameObject.tag== "Player"){
        transform.parent.gameObject.GetComponent(Puzzle_Controller).SwitchPause();
    }
}