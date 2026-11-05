if(obj_gameManager.gameOver == false)
{
audio_play_sound(snd_popSound,1, false);
instance_destroy()
instance_create_depth(x,y,1,obj_explosion);
obj_gameManager.gameScore++
}