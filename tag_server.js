let spawns = [];
let model = "adder";
let defaultTime = 600000;
let warning = false;
const {
    triggerAsyncId
  } = require("async_hooks");
  const { spawn } = require("child_process");


let lastUpdate = new Date(1970,1,1);
let startTime = new Date(1970,1,1);
let players = [];

on("playerDropped", (reason) => {

    
    players = players.filter( (p) => { p.id != global.source});
    console.log(`Player ${GetPlayerName(global.source)} dropped (Reason: ${reason}).`)
    console.log("players",players);
    emitNet('tag:updateplayers',-1, players);

    let player = players.find( (p) => { p.id == global.source});
    if(player)
    {
        if(player.chaser){
            //need to assign a new chaser
            randomisechaser();
        }
    }
});

onNet('onServerResourceStart', (resource) => {
    // console.log("resource started: ",resource);
    if (resource == "tag") {
        spawns = JSON.parse(LoadResourceFile(GetCurrentResourceName(),"spawnLocations.json"))
        //console.log(spawns);
    }

});

onNet('tag:settimer', (seconds) => {
    defaultTime = seconds * 1000;
    console.log(`timer set to ${defaultTime}` );

})

onNet('tag:setcar', (m) => {
    if(model != m){
    model = m;
    emitNet('tag:setcar',-1, model);
    }

})

  onNet('tag:registervehicle',(playerid,vehicleentityid) => {
    if( players.filter( (player) => playerid ==player.id ).length == 0){
        players.push({
            id: playerid,
            chaser: false,
            position: {
                x: spawns[players.length].x,
                y: spawns[players.length].y,
                z: spawns[players.length].z,
                direction: spawns[players.length].direction,

            },
            vehicleid: vehicleentityid
        })
    } else {
        players.forEach( (player,index) =>{
            if(player.id == playerid){
                players[index].vehicleid = vehicleentityid;
            }
        })
    }
   // console.log(players)
    emitNet('tag:updateplayers',-1, players);

  })


function randomisechaser() {
    const randIndex = Math.floor(Math.random() * players.length);
    players.forEach( (player,index) => {
        if(player.chaser == true && randIndex != index){
            
            player.chaser = false;
            emitNet('tag:notchaser',player.id);
        }

        if(player.chaser == false && randIndex == index)
        {
            player.chaser = true;
            emitNet('tag:chaser',player.id);
           



        }
    })
    const minutes = Math.floor(defaultTime / 60000);
    const seconds = Math.floor((defaultTime - (minutes * 60000)) / 1000);
    emitNet('tag:updateplayers',-1, players);
    emitNet('tag:drawtxt', -1,
    0.5,
    0.4,
    1,
    `${minutes}m ${seconds}s Timer Started! Don't be the white car!`,
    255,
    255,
    255,
    255,
    5000
  );
    emitNet('tag:start',-1,defaultTime);
    lastUpdate = new Date();
    startTime = lastUpdate;

    setTick(() => {
        
        currentTime = new Date();
        //console.log("currentTime:",currentTime);
        //console.log("startTime:",startTime);
        //console.log("currentTime-startTime:",currentTime-startTime);
       // console.log("startTime+defaultTime:",startTime + defaultTime);

        //console.log("IsStarted",startTime)
        //console.log("timer:",currentTime - (startTime + defaultTime));

        if(startTime && !warning && (currentTime - startTime) + 10000 > defaultTime ) {
            emitNet('tag:drawtxt', -1,
                0.5,
                0.5,
                1,
                `10 Seconds Left!!`,
                255,
                255,
                255,
                255,
                5000
              );
              warning = true;

        }


        if( startTime && currentTime - startTime > defaultTime )
        {
            
            console.log("killplayer")
            //kill the player
            players.forEach( (player,index) => {
                if(player.chaser == true){
                    let chasername = GetPlayerName(player.id);
                    player.chaser = false;
                    startTime = undefined;
                    emitNet('tag:killplayer',player.id);
                    emitNet('tag:drawtxt', -1,
                0.5,
                0.5,
                1,
                `${chasername} Exploded!`,
                255,
                255,
                255,
                255,
                5000
              );
                    
                }
        
               
            })
            startTime = undefined;
            warning =false;
            
            emitNet('tag:updateplayers',-1, players);
            //end the game
            

        }
  
      
    })
  
    //console.log(players);

}

onNet('tag:randomisechaser', () =>{ randomisechaser()} )

onNet('tag:touch', (victim,chaser) => {
    //console.log("victim",victim)
    //console.log("chaser",chaser)
    //console.log("lastUpdate",lastUpdate - new Date())
    if(new Date() - lastUpdate > 5000)
    {
        console.log("victim",victim);
        players.forEach( (player,index) => {
            player.chaser = false;
            if(player.id == chaser){
                
                player.chaser = false;
                emitNet('tag:notchaser',player.id);
            }

            if(player.id == victim)
            {
                let victimname = GetPlayerName(victim);
                const lastRun = new Date() - lastUpdate;
                const minutes = Math.floor(lastRun / 60000);
                const seconds = Math.floor((lastRun - (minutes * 60000)) / 1000);
                player.chaser = true;
                lastUpdate = new Date();
                emitNet('tag:chaser',player.id);
                console.log("new chaser", player.id);
                emitNet('tag:drawtxt', -1,
                0.5,
                0.4,
                1,
                `TAG! ${victimname} is now it!`,
                255,
                255,
                255,
                255,
                5000
              );

            }
        })
    emitNet('tag:updateplayers',-1, players);
    //console.log(players);
}
})
