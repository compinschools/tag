let position = {
    x: 905,
    y: -48,
    z: 78.36,
    direction: 0
}
let model = "adder";

let lastBlips = new Date(1970,1,1);

let playerVehicle;
Delay = (ms) => new Promise(res => setTimeout(res, ms));
let players;
function getServerId() {

    pi = GetPlayerIndex();
    //console.log("index",pi);
    sid = GetPlayerServerId(pi)
   // console.log("sid",sid);
    return sid;
  }


  
  onNet('tag:chaser',() => {
    SetVehicleColours(playerVehicle,5,5)

  })

  onNet('tag:notchaser',() => {
    SetVehicleColours(playerVehicle,1,1)

  })
  onNet('tag:updateplayers',(p) => {
    players = p;
    current = players.find( (player) => player.id == getServerId());
    
    if(current && current.position.x != position.x){
        //console.log("reset position",position);
        //console.log("reset current",current);
        position = current.position;

        //console.log("reset position",position);
        exports.spawnmanager.forceRespawn()
    }
    //console.log("players",p);

  })



onNet('onClientGameTypeStart', () => {
    TriggerServerEvent("tag:initialise");
    //const sid = getServerId();
    exports.spawnmanager.setAutoSpawnCallback(() => {
        //console.log(`spawnPos: ${spawnx},${spawny},${spawnz}, `);
    
        exports.spawnmanager.spawnPlayer({
          x: position.x,
          y: position.y,
          z: position.z,
          heading: position.direction
        }, async () => {
    
          //RemoveVehiclesFromGeneratorsInArea(spawnx-100, spawny-100, spawnz-100, spawnx+100, spawny+100, spawnz+100,1);
          //SetEntityRotation(PlayerPedId(),0,0,spawnPos.direction)
          //await Delay(2000);
          //console.log("spawn")
          const ped = PlayerPedId();
          coords = GetEntityCoords(ped);
          //console.log("coords",coords)
          const nv = await Car( model=model,
            damage=undefined,
            color=undefined,
            x=coords[0],
            y=coords[1],
            z=coords[2]+50,
            heading=GetEntityHeading(ped),
            fuel=undefined);           
           // console.log("spawn end")
          })
          
        });
      
    
      exports.spawnmanager.setAutoSpawn(true)
      exports.spawnmanager.forceRespawn()
    });

onNet('tag:setcar',(m) => {
  if(m != model){
    model = m;
    exports.spawnmanager.forceRespawn();
  }

})

RegisterCommand('setcar', (source,args,raw) => {
  if(args.length> 0 && model != args[0]) {
    TriggerServerEvent('tag:setcar',args[0]);
  }
})

RegisterCommand('car', async (source, args, raw) => {

  let model;
  if(args.length > 0) {
    model = args[0];
  }
        const ped = PlayerPedId();
        const coords = GetEntityCoords(ped);
        //console.log(coords);
          const nv = await Car(
              model=model,
              damage=undefined,
              color=undefined,
              x=coords[0],
              y=coords[1],
              z=coords[2],
              heading=GetEntityHeading(ped),
              fuel=undefined);
          //console.log(nv);

}, false);

RegisterCommand('emptycar', async (source, args, raw) => {
    const ped = PlayerPedId();
    const coords = GetEntityCoords(ped);

      const nv2 = await EmptyCar(
        model=undefined,
        damage=undefined,
        color=undefined,
        x=coords[0]+5,
        y=coords[1],
        z=coords[2],
        heading=GetEntityHeading(ped),
        fuel=undefined);
    //console.log(nv2);
}, false);

RegisterCommand('start', (source, args, raw) => {
    TriggerServerEvent('tag:randomisechaser');

})  

RegisterCommand('randomise', (source, args, raw) => {
    TriggerServerEvent('tag:randomisechaser');

})  

RegisterCommand('setblips', (source, args, raw) => {
    setBlips();

})  
    
      async function EmptyCar(model="adder", damage=1, color=1, x=0, y=0, z=0, heading=-1,fuel=1000) {
       // console.log("x",x)
        //console.log("model",model)
        //console.log("usage: car <model> <damage -4000 to 1000> <color (integer)>")
        
        // check if the model actually exists
        const hash = GetHashKey(model);
        if (!IsModelInCdimage(hash) || !IsModelAVehicle(hash)) {
          console.log(`Invalid Car Model ${model}`);
          return;
        }
      
        // Request the model and wait until the game has loaded it
        RequestModel(hash);
        while (!HasModelLoaded(hash)) {
          await Delay(500);
        }
      
        

        // Create a vehicle at the player's position
        const vehicle = CreateVehicle(hash, x,y,z+50,heading, true, true);
        const obj = GetObjectIndexFromEntityIndex(vehicle);
        PlaceObjectOnGroundProperly(obj);
        SetVehicleDamageModifier(vehicle, damage);
       
      
        SetVehicleColours(vehicle, color, color);
        SetVehicleFuelLevel(vehicle, fuel);
        // Allow the game engine to clean up the vehicle and model if needed
       // SetEntityAsNoLongerNeeded(vehicle);
      
        SetModelAsNoLongerNeeded(model);
        
        
        const nv = NetworkGetNetworkIdFromEntity(vehicle);
        //each time a vehicle is created by a player, update the server to what that vehicle is
        TriggerServerEvent("tag:registervehicle",100,nv);
        return playerVehicle; 
      }

    async function Car(model="adder", damage=1, color=1, x=0, y=0, z=0, heading=-1,fuel=1000) {
        //console.log("x",x)
        //console.log("model",model)
        //console.log("usage: car <model> <damage -4000 to 1000> <color (integer)>")
        if (playerVehicle) {
            DeleteEntity(playerVehicle);
            //console.log("deleted vehicle")
        }

        // check if the model actually exists
        const hash = GetHashKey(model);
        if (!IsModelInCdimage(hash) || !IsModelAVehicle(hash)) {
          console.log(`Invalid Car Model ${model}`);
          return;
        }
      
        // Request the model and wait until the game has loaded it
        RequestModel(hash);
        while (!HasModelLoaded(hash)) {
          await Delay(500);
        }
      
        const ped = PlayerPedId();

        // Create a vehicle at the player's position
        const obj = GetGroundZFor_3dCoord(x,y,z+50,false)
        //console.log(obj);
        const vehicle = CreateVehicle(hash, x,y,obj[1],heading, true, true);
        
         //const obj = GetObjectIndexFromEntityIndex(vehicle);
        
        SetPedIntoVehicle(ped, vehicle, -1);
        SetVehicleDamageModifier(vehicle, damage);
       
      //local vehicle = GetVehiclePedIsIn(playerPed)
      //SetVehicleNumberPlateText(vehicle, GetPlayerName( GetPlayerIndex()))
        // Set the player into the drivers seat of the vehicle
        SetVehicleColours(vehicle, color, color);
        SetVehicleFuelLevel(vehicle, fuel);
        // Allow the game engine to clean up the vehicle and model if needed
        SetEntityAsNoLongerNeeded(vehicle);
      
        SetModelAsNoLongerNeeded(model);
       // console.log("model",model)
        playerVehicle = vehicle; 
        const nv = NetworkGetNetworkIdFromEntity(vehicle);
        //each time a vehicle is created by a player, update the server to what that vehicle is
        TriggerServerEvent("tag:registervehicle",getServerId(),nv);
       // setBlips();
        return playerVehicle; 
      }


//work out touching  
  setTick(() => {
      if(players){
    players.forEach( (player,index) => {
      const entityid = NetworkGetEntityFromNetworkId(player.vehicleid);
      if( entityid && playerVehicle && entityid != playerVehicle && player.chaser && IsEntityTouchingEntity(playerVehicle,entityid))
      {
        console.log("touching");
        const index = GetPlayerFromServerId(player.id);
        TriggerServerEvent('tag:touch', getServerId(), GetPlayerName(index));
      }

    } )
    // console.log("blip timer",new Date() - lastBlips)
    if(new Date() - lastBlips > 1000) {
        setBlips();
        
    }
}

    
  })




  function setBlips() {

    players.forEach(P => {
        //console.log("forblips",P)
        const entity = NetworkGetEntityFromNetworkId(P.vehicleid)
        var blip = GetBlipFromEntity(entity);
        //console.log(blip)
        if (entity != 0 && !blip && !P.chaser) {
          blip = AddBlipForEntity(entity);
  
  
        //   SetBlipNameToPlayerName(blip, GetPlayerName(index));
          SetBlipAsShortRange(blip, true);
          PulseBlip(blip);
        }
        
        // console.log(serverid,escapee)
        if (!P.chaser) {
          //SetBlipSprite(blip, 429)
          SetBlipSprite(blip, 1)
        } else if(blip) {
          RemoveBlip(blip);
        }
  
  
      
      // }
  
    });
    lastBlips = new Date();
  }
