#pragma strict

public var moveToScore:float;
public var hScore:float;

public var parentTile:GameObject;

//Waypoint Vars
public var iWaitTime:int;
private var iWaitCounter:int;

public var bLookAtPoint:boolean;
public var iLookAtTime:int;

public var bCauseReaction:boolean;
public var reactCharacter:GameObject;

public var bShooting:boolean;
public var shootTarget:GameObject;

public var idleAnimation:String;

//This class defined the nodes used as part of the pathfinding system, as well as the main points along a patrol route

function Start () {
	
}

function Update () {

}

function NextWaypoint():boolean{ //This function is called when an NPC is checking to see if they can move onto the next node in their patrol route
    if(bCauseReaction==true){
        if(reactCharacter!=null){
            if(reactCharacter.GetComponent(EnemyController).iBehaviour!=10){
                BringReaction();
            }
        } 
    }
	iWaitCounter++;
	if(iWaitTime==-1){
		return false;
	}
	else if(iWaitCounter>=iWaitTime){
		iWaitCounter=0;
		return true;
	}else{
		return false;
	}
}

    public function BringReaction(){ //This causes another NPC to react to this one, when appropriate. 
        if(bCauseReaction==true){
            reactCharacter.GetComponent(EnemyController).React(gameObject,iWaitTime);
        }
    }

    function RelinquishReactive(){ //This stops another NPC from reacting to this one 
        if(bCauseReaction==true && reactCharacter!=null){
            reactCharacter.GetComponent(EnemyController).StopReact();
        }
    }

function GetAdjacentTiles():Array{ //This function is very important to the A* pathfinding of the NPCs. It has to establish which adjacent tiles can be considered 'reachable' from this tile.
	var tileList:GameObject[];
	var iNumberOfNodes:int=0;
	for(var child:Transform in transform.parent){
		if(child.gameObject.tag == "walkable" && child.gameObject != gameObject){
			iNumberOfNodes++;
		}
	}
	tileList = new GameObject[iNumberOfNodes];
	iNumberOfNodes=0;
	for(var child:Transform in transform.parent){
		if(child.gameObject.tag == "walkable" && child.gameObject != gameObject){
			tileList[iNumberOfNodes] = child.gameObject;
			iNumberOfNodes++;
		}
	}
	
	var adjacentTiles:Array = new Array();
	var iCounter:int;
	for(iCounter=0;iCounter<tileList.length;iCounter++){
	    if((tileList[iCounter].transform.position - gameObject.transform.position).magnitude < 0.4){ //Originally this section only checked to see if a tile is within a certain distance to consider it 'adjacent'
	        //This had to be expanded upon immensely. Using raycasts to check if a tile is adjacent and unobstructed. 
	        //As raycasts will collide with various unwanted things, such as this tile's own collider and possibly characters standing on them; it is neccessary to disable these colliders and continue looping
	        //Moreover, it is neccessary to do several raycasts between tiles to ensure there is enough space for an NPC, as a single raycast doesn't prove there is enough room. This involves finding the perepdnciular
            //vector, and testing from 2 points along this vector in the original direction.

	        var finishedChecking:boolean = false;
	        var objectsCollided:Array = new Array();
	        while(finishedChecking==false){
	            var vector:Vector2 = tileList[iCounter].transform.position - gameObject.transform.position;
	            var magnitude = vector.magnitude;
	            vector = vector/magnitude;
	            var ray:RaycastHit2D;
	            ray = Physics2D.Raycast(Vector2(transform.position.x,transform.position.y), vector, magnitude);

	            if(ray.collider.gameObject.tag != "walkable" && ray.collider.gameObject.name.Contains("Door")==false && ray.collider.gameObject.name.Contains("CollisionBall") == false){
	                finishedChecking=true; //This would occur if the path to the tile being evaluated is clearly blocked.
	            }else{
	                if(ray.collider.gameObject == tileList[iCounter]){
	                    //finishedChecking=true;
	                    //adjacentTiles.push(tileList[iCounter]);

	                    //Check pependicular points to ensure there's enough space 
	                    var perpendicularVector:Vector2 = Vector2(-vector.y, vector.x);
	                    ray = Physics2D.Raycast(transform.position + (perpendicularVector*0.03), vector, magnitude);
	                    //Debug.DrawLine(transform.position+(perpendicularVector*0.03), (transform.position+(perpendicularVector*0.03)) + (vector*magnitude), Color.white,10f);
	                    if(ray.collider.gameObject == tileList[iCounter]){
	                        ray = Physics2D.Raycast(transform.position - (perpendicularVector*0.03), vector, magnitude);
	                        //Debug.DrawLine(transform.position-(perpendicularVector*0.03), (transform.position+(perpendicularVector*0.03)) + (vector*magnitude), Color.white,10f);
	                        if(ray.collider.gameObject == tileList[iCounter]){
	                            finishedChecking=true;
	                            adjacentTiles.push(tileList[iCounter]);
	                            Debug.DrawLine(transform.position, tileList[iCounter].transform.position,Color.white,10f);
	                        }else{
	                            if(ray.collider.gameObject.tag!="walkable" && ray.collider.gameObject.name.Contains("Door")==false && ray.collider.gameObject.name.Contains("CollisionBall") == false && ray.collider.gameObject.name.Contains("CheckPoint")==false){
	                                finishedChecking=true;
	                                Debug.DrawLine(transform.position- (perpendicularVector*0.03), ray.point,Color.red,10f);
	                            }else{
	                                ray.collider.gameObject.SetActive(false);
	                                objectsCollided.push(ray.collider.gameObject);
	                            }
	                        }
	                    }else{
	                        if(ray.collider.gameObject.tag!="walkable" && ray.collider.gameObject.name.Contains("Door")==false  && ray.collider.gameObject.name.Contains("CollisionBall") == false){
	                            Debug.DrawLine(transform.position+ (perpendicularVector*0.03), ray.point,Color.red,10f);
	                            finishedChecking=true;
	                        }else{
	                            ray.collider.gameObject.SetActive(false);
	                            objectsCollided.push(ray.collider.gameObject);
	                        }
	                    }
	                }else{
	                    ray.collider.gameObject.SetActive(false);
	                    objectsCollided.push(ray.collider.gameObject);
	                }
	            }
	        }
	        for(var x:int=0;x<objectsCollided.length;x++){
                var temp:GameObject = objectsCollided[x];
                temp.SetActive(true);
	        }
	        

            //This is a very old section of code, originally written in the place of the above section. It also uses raycasts to establish which tiles are adjacent to this tile.
            //However it didn't work for reasons that were later shown to be caused by the depth sorting system.
            
	        /*if(ray.collider.gameObject.tag == "walkable"){
	            Debug.DrawLine(transform.position, tileList[iCounter].transform.position,Color.white,10f);
	            vector = gameObject.transform.position - tileList[iCounter].transform.position;
	            magnitude = vector.magnitude;
	            vector = vector/magnitude;
	            ray = Physics2D.Raycast(tileList[iCounter].transform.position, vector, magnitude);

	            if(ray.collider.gameObject.tag == "walkable"){
	                adjacentTiles.push(tileList[iCounter]);
	                
	            }else{
	                //Debug.DrawLine(transform.position, tileList[iCounter].transform.position,Color.white,10f);
	            }
	        }else{
	            Debug.DrawLine(transform.position, tileList[iCounter].transform.position,Color.red,10f);
	            if(ray.collider.gameObject.name.Contains("Doorway")){
	                ray.collider.gameObject.SetActive(false);
	                vector = tileList[iCounter].transform.position - gameObject.transform.position;
	                magnitude = vector.magnitude;
	                vector = vector/magnitude;
	                ray = Physics2D.Raycast(Vector2(transform.position.x,transform.position.y), vector, magnitude);

	                if(ray.collider.gameObject.tag == "walkable"){
	                    adjacentTiles.push(tileList[iCounter]);
	                }
	                ray.collider.gameObject.SetActive(true);
	            }
	        }*/
		}
		/*if(tileList[iCounter].transform.position.y >= gameObject.transform.position.y) {
			if(tileList[iCounter].transform.position.y - gameObject.transform.position.y < 0.4){
				if(tileList[iCounter].transform.position.x >= gameObject.transform.position.x && tileList[iCounter].transform.position.x - gameObject.transform.position.x <0.4){
					adjacentTiles.push(tileList[iCounter]);
				}else if(tileList[iCounter].transform.position.x < gameObject.transform.position.x && gameObject.transform.position.x - tileList[iCounter].transform.position.x > -0.4){
					adjacentTiles.push(tileList[iCounter]); 
				}
			}
		}else{
			if(gameObject.transform.position.y - tileList[iCounter].transform.position.y>-0.4){
				if(tileList[iCounter].transform.position.x > gameObject.transform.position.x && tileList[iCounter].transform.position.x - gameObject.transform.position.x < 0.4){
					adjacentTiles.push(tileList[iCounter]);
				}else if(tileList[iCounter].transform.position.x < gameObject.transform.position.x && gameObject.transform.position.x - tileList[iCounter].transform.position.x > 0.4){
					adjacentTiles.push(tileList[iCounter]); 
				}
			}
		}*/
		/*var vector:Vector2= tileList[iCounter].transform.position - gameObject.transform.position;		
		var magnitude = vector.magnitude;
		vector = vector/magnitude; 			
		var ray:RaycastHit2D;
		
		var bFinished:boolean = false;
		var offColliderList:Array = new Array();
		offColliderList.push(gameObject);
		gameObject.GetComponent(Collider2D).enabled = false;
		
		while(bFinished!=true){
			if(Physics2D.Raycast(Vector2(transform.position.x,transform.position.y),vector,magnitude)){
				ray = Physics2D.Raycast(Vector2(transform.position.x,transform.position.y),vector,magnitude);
				if(ray.collider.gameObject.name == "PatrolWaypoint" && ray.collider.gameObject != tileList[iCounter]){
					adjacentTiles.push(ray.collider.gameObject);
					ray.collider.gameObject.GetComponent(Collider2D).enabled = false;
					offColliderList.push(ray.collider.gameObject);
				}else {
					if(ray.collider.gameObject == tileList[iCounter]){
						adjacentTiles.push(tileList[iCounter]);
					}
					bFinished = true;
				}
			}else{
				bFinished = true;
			}
		}
		for(var j:int=0;j<offColliderList.length;j++){
			var object:GameObject = offColliderList[j];
			object.GetComponent(Collider2D).enabled = true;
		}*/
	}
	return adjacentTiles;
}

function RemovePathingScores(){//Used to reset a tile's evaluation in the pathfinding system
	moveToScore = 0;
	hScore =0;
	parentTile = null;
}