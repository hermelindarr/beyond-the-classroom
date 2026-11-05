
if obj_gameManager.gameOver == false
{
audio_play_sound(snd_sadWhistleSound,1, false )
}
obj_gameManager.starsLost++
show_debug_message(obj_gameManager.starsLost)
instance_destroy()