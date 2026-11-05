frameCount++

if (instance_number(obj_star) <=0){
	for (var i = 0; i < wave; i += 1)
instance_create_depth(random_range(0+50, room_width-50), -150, 1, obj_star)
wave++
}

if(starsLost>= 3 && gameOver == false){
 instance_create_depth(room_width/2,room_height/2,0,obj_gameOver)
 gameOver = true
 audio_play_sound(snd_gameOverSound, 1,false)
 audio_stop_sound(snd_wizardSong)
}