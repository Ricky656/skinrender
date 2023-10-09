#pragma strict

public var soundPlayers:GameObject[];

public var doorOpening:AudioClip;
public var musketShot:AudioClip;

function Start () {

}

function Update () {

}

//THIS CLASS ISN'T CURRENTLY USED. IT WAS SETUP TO ALLOW SOUND EFFECTS TO BE PLAYED USING MULTIPLE CHANNELS 

private function PlaySound(sound:AudioClip){
    var freePlayer:GameObject = FindFreePlayer();

    freePlayer.GetComponent(AudioSource).clip = sound;
    freePlayer.GetComponent(AudioSource).Play();
}

private function FindFreePlayer():GameObject{
    for(var iCounter:int=0;iCounter<soundPlayers.length;iCounter++){
        if(soundPlayers[iCounter].GetComponent(AudioSource).isPlaying == false){
            return soundPlayers[iCounter];
        }
    }
}


//specific sound functions

public function PlayGunshot(){
    if(musketShot==null){
        Debug.Log("Missing gunshot audio");
        return;
    }
    PlaySound(musketShot);
}