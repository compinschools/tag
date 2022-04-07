let spawns = [];

const {
    triggerAsyncId
  } = require("async_hooks");
  const { spawn } = require("child_process");


let lastUpdate = new Date(1970,1,1);
let players = [];

onNet('onServerResourceStart', (resource) => {
    // console.log("resource started: ",resource);
    if (resource == "tag") {
        spawns = JSON.parse(LoadResourceFile(GetCurrentResourceName(),"spawnLocations.json"))
        console.log(spawns);
    }

});

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
    console.log(players)
    emitNet('tag:updateplayers',-1, players);

  })



onNet('tag:randomisechaser', () => {
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
    emitNet('tag:updateplayers',-1, players);
    emitNet('tag:drawtxt', -1,
    0.5,
    0.4,
    1,
    `Timer Started! Good Luck!`,
    255,
    255,
    255,
    255,
    5000
  );
    lastUpdate = new Date();
    //console.log(players);

})

onNet('tag:touch', (victim,chaser,chasername=" ") => {
    //console.log("victim",victim)
    //console.log("chaser",chaser)
    //console.log("lastUpdate",lastUpdate - new Date())
    if(new Date() - lastUpdate > 3000)
    {

        players.forEach( (player,index) => {
            player.chaser = false;
            if(player.id == chaser){
                
                player.chaser = false;
                emitNet('tag:notchaser',player.id);
            }

            if(player.id == victim)
            {
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
                `TAG! You're it! ${chasername} last run was ${minutes}m and ${seconds}s`,
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
