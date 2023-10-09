#pragma strict

function Start () {

}

function Update () { //Cuases object to follow mouse, and rotate slightly
    transform.position = Camera.main.ScreenToWorldPoint(Input.mousePosition);
    transform.position.z = -5;
    transform.Rotate(Vector3.back * Time.deltaTime * 30);
}