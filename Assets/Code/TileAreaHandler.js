#pragma strict

function Start () {
    
}

function Setup(){//Tile areas are used to group tiles together so they may be more easily added to puzzles to build up a room. This function is called at runtime to remove the tile area objects and
    //set all tiles to be children of the parent puzzle, this allows the depth sorting and pathfinding to work properly.
    while(transform.childCount>0){
        transform.GetChild(0).parent = transform.parent;
    }
    Destroy(gameObject);
    Destroy(this);
}