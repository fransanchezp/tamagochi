Hola buenas, antes de nada la mayor parte del codigo la he hecho yo, he utilizado la IA para la parte visual como los estilos y para preguntar errores que me dieron al principio porque no se me mostraban los jugadores graficamente, las partes del codigo hechas por ella las he quitado y las he sustituido por codigo hecho por mi, tengo varios errores en el codigo, por ejemplo cuando presiono el boton de disparar en cualquier momento si que un jugador este al lado del otro el juego lo interpreta como que se ha terminado la partida, cada vez que acciono un movimiento se recarga la interfaz pero todo el tablero mantiene su correcto estado.

El juego lo he hecho de dos jugadores para que se me resulte más sencillo y así poder hacerlo sin atrancarme. A continuación le digo su funcionamiento:

- Interacción de cuando un jugador interactua con el teclado:
  Captura del Evento:En el cliente (en el UIv1), he configurado un event listener para capturar los eventos de pulsación de teclas. Luego con la función handleKeyPress identifica qué tecla se ha presionado (como las flechas para mover, la tecla r para rotar o la barra espaciadora para disparar).
  Procesamiento en el Servidor:
  En el servidor, la clase ServerService escucha el evento "action". Al recibirlo:
    Se identifica el jugador que envió la acción a partir de su socket.id.
    Se valida la acción (por ejemplo, usando métodos de PlayerHandler como canMove o canShoot).
    Se actualiza el estado del juego (movimiento, rotación o disparo) y se modifica la posición o el estado del jugador.
    Finalmente, se envía un mensaje actualizado a todos los clientes para sincronizar el estado del juego.
  
- Creación del Tablero y su Representación en el Cliente:
  La generación y visualización del tablero se realiza de la siguiente manera:

    Generación del Tablero en el Servidor:
    
    Se utiliza la clase BoardBuilder para crear un tablero de tamaño NxN (actualmente implementado como 10x10).
    Se inicializa unarray bidimensional llena de ceros y se colocan elementos especiales:
      Casillas de escondite: Se asigna el valor 5 en posiciones determinadas, siguiendo reglas de posicionamiento para evitar aglomeraciones.
      Posiciones de jugador: Se asigna el valor 6 en algunas esquinas (actualmente se seleccionan dos esquinas de forma aleatoria).
      El tablero generado se almacena en el objeto Game y se comparte con los jugadores mediante mensajes.

  
  Representación en el Cliente:
  
    Al recibir el tablero y la lista de jugadores mediante el evento GAME_UPDATE, la función UIv1.drawBoard(board, players) se encarga de renderizarlo.
    Se crea una cuadrícula HTML (usando CSS Grid) donde cada celda representa una casilla del tablero.
    Se aplican estilos para mostrar:
      Los bushes: Con un color de fondo verde oscuro.
      Los jugadores: Representados por un div con imagen (por ejemplo, la imagen de Goku) y posicionados según sus coordenadas.
      Se usan animaciones (con la librería anime.js) para suavizar la aparición de las casillas y el movimiento de los jugadores.

-Conexión Cliente-Servidor:
Inicialización de la Conexión en el Cliente:
  El cliente utiliza la librería socket.io-client para conectarse al servidor
Se establece una conexión cuando el cliente carga la aplicación y se notifica a través del evento "connectionStatus".
Inicialización del Servidor con Socket.IO:
  En el servidor, la clase ServerService se encarga de inicializar el servidor WebSocket sobre un servidor HTTP.
Al producirse la conexión, se configura un manejador de eventos que gestiona la conexión, registra al jugador y escucha los eventos de acción enviados por el cliente.

-Intercambio de Mensajes:

  Del Cliente al Servidor:
    El cliente envía mensajes de acción (como MOVE, ROTATE y SHOOT) al servidor cada vez que el usuario interactúa con la interfaz.
Del Servidor al Cliente:
  Tras procesar las acciones, el servidor envía mensajes de actualización (por ejemplo, GAME_UPDATE, NEW_PLAYER, GAME_END) a todos los clientes, asegurando que todos tengan una vista sincronizada del estado del juego.
  Manejo de Desconexiones:
El servidor escucha eventos de desconexión para gestionar la salida de jugadores, aunque se podría extender para manejar reconexiones sin interrumpir la partida.

Ahora voy a decirle los objetivos conseguidos y no conseguidos:
 -Conseguidos: 
    He conseguido que se me generen los arbustos de forma aleatoria sin que toque las esquinas y sin que haya un arbusto de forma adyacente, me refiero que 
    ningun arbusto tenga otro arbusto alrededor suya.
    El tablero no se crea hasta que los dos jugadores esten conectados
    Los dos jugadores se posicionan de forma aleatoria entre las 4 esquinas del mapa
    Los jugadores se mueven y rotan mediante las teclas de la pantalla o por las teclas del teclado(izquierda: flecha de izquierda, derecha: tecla flecha 
    derecha, rotar: con la tecla r y disparar con la tecla del espacio).
    El servidor recibe cuando un jugador se conecta y desconecta.
-No conseguidos o errores que veo en mi programa:
Que sea de 2 jugadores en vez de 4
Que el boton de disparar funcione solo cuando un jugador esta al lado del otro
Cuando le doy a una flecha del jugador el jugador me rota en el sentido de la flecha, en parte queria que fuese asi de primeras pero en terminos de usabilidad no es lo idoneo y me di cuenta antes.
Que cuando un jugador se mete en un arbusto el otro jugador ve en que arbusto esta pero este error si que es verdad que no es complicado de arreglar
Una animacion de cuando un jugador gana o pierda la partida

  
