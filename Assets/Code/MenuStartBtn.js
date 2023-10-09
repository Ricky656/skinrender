#pragma strict

public var rolloverSprite:Sprite;
public var defaultSprite:Sprite;

function Start(){
    transform.Find("startText").gameObject.GetComponent(Renderer).sortingOrder=4;
}

//Updates sprites on the button to give the user some feedback
function OnMouseEnter(){
    GetComponent(SpriteRenderer).sprite = rolloverSprite;
}

function OnMouseExit(){
    GetComponent(SpriteRenderer).sprite = defaultSprite;
}

function OnMouseUpAsButton(){
    GameObject.Find("GameController").GetComponent(GameController).BeginGame();//Calls the function of the button
}