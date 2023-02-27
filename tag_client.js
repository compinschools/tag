let position = {
    x: 905,
    y: -48,
    z: 78.36,
    direction: 0
}

let startTime = undefined;
let defaultTime = 600000;

let blips = [];
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

  onNet('tag:start',(timer) => {
    defaultTime = timer;
    startTime = new Date();

  } )

  onNet('tag:killplayer',() => {
    console.log("player kill recieved",playerVehicle);
    NetworkExplodeVehicle(playerVehicle, true,true);
  })


  
  onNet('tag:chaser',() => {
    SetVehicleColours(playerVehicle,5,5)

  })

  onNet('tag:notchaser',() => {
   // console.log("notechaser anymore")
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

  RegisterCommand('checkplayers', () => {
    console.log(players);

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
           //set colours
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

RegisterCommand('help',(source,args,raw) => {
  console.log("Tag Help")
  console.log("--------")
  console.log("setcar <model>")
  console.log(" - Sets the car of all players to the model specified")
  console.log("settimer <seconds>")
  console.log(" - Sets the timer before the player who is 'it' explodes")
  console.log("start")
  console.log(" - Randomly chooses a player to be 'it' and starts the timer")
  console.log("randomise")
  console.log(" - Randomly chooses a player to be 'it' and starts the timer")
  console.log("car <model>")
  console.log(" - changes only the current players car to the model specified")


})


function drawTxt(x, y, scale, text, r, g, b, a) {
  let aspect = Math.floor(GetAspectRatio(true) * 1000)
  SetTextFont(4)
  //SetTextProportional(1)
  SetTextScale(scale, scale)
  SetTextColour(r, g, b, a)
  SetTextDropShadow(0, 0, 0, 0, 255)
  //SetTextEdge(2, 0, 0, 0, 255)
  //SetTextJustification(0);
  SetTextCentre(true);
  SetTextDropShadow()
  SetTextOutline()
  SetTextEntry("STRING")
  AddTextComponentString(text)

  DrawText(x, y)
}

RegisterCommand('settimer', (source,args,raw) => {
  if(args.length > 0 ){
    TriggerServerEvent('tag:settimer',parseInt(args[0]));
    console.log(`Timer set to ${args[0]} seconds`);
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

      RegisterCommand('whereami', (source, args, raw) => {
        const ped = PlayerPedId();
      
        // Get the coordinates of the player's Ped (their character)
        const coords = GetEntityCoords(ped);
        console.log(`You are here:  ${coords}`);
      
        const direction = GetEntityHeading(ped);
        console.log('Heading:',direction);
      
      })

//work out touching  
  setTick(() => {
      if(players){
    players.forEach( (player,index) => {
      const entityid = NetworkGetEntityFromNetworkId(player.vehicleid);
      if( entityid && playerVehicle && entityid != playerVehicle && player.chaser && IsEntityTouchingEntity(playerVehicle,entityid))
      {
        //console.log("touching");
        const index = player.id;
        //console.log("playerindex",getServerId());
        //console.log("player.id",index);
        TriggerServerEvent('tag:touch', getServerId(), player.id);
      }

    } )
    // console.log("blip timer",new Date() - lastBlips)
    if(new Date() - lastBlips > 1000) {
        setBlips();
        
    }

    if(startTime){
      let milli = defaultTime - (new Date() - startTime);
      if(milli < 0){
        startTime = undefined;
      }
      const minutes = Math.floor(milli / 60000);
    const seconds = Math.floor((milli - (minutes * 60000)) / 1000);

      drawTxt(0.5, 0.1, 1, `Time Left: ${minutes}m ${seconds}s`, 255,255, 255, 255)
    }
}

    
  })



  function removeBlips() {

    if(blips){
    blips.forEach(b => {
      
          RemoveBlip(b);
        }

    )
  
  }
}

  function setBlips() {
    //removeBlips();
    playerblips = [];
    players.forEach(P => {
        //console.log("forblips",P)
        const entity = NetworkGetEntityFromNetworkId (P.vehicleid)
        var blip = GetBlipFromEntity(entity);
        
        //console.log(blip)
        if (entity != 0 && !blip && !P.chaser) {
          blip = AddBlipForEntity(entity);
          blips.push(blip);
          
  
        //   SetBlipNameToPlayerName(blip, GetPlayerName(index));
          SetBlipAsShortRange(blip, true);
          PulseBlip(blip);
        }
        playerblips.push(blip);
        // console.log(serverid,escapee)
        if (!P.chaser) {
          //SetBlipSprite(blip, 429)
          SetBlipSprite(blip, 1)
        } else if(blip) {
          RemoveBlip(blip);
          blips = blips.filter( (b) => b != blip);
        }
  
  
      
      // }
  
    });
    blips.forEach( (blip) => {
      if(!playerblips.includes(blip)){
        RemoveBlip(blip);
        blips = blips.filter( (b) => b != blip);
        console.log("removed ghost blip");
      }

    } )
    lastBlips = new Date();
  }
