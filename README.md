# MongoJS
___

Repositorio creado para la implementación de una librería dinámica con la que poder realizar una comunicación entre un videojuego cualquiera y el [sistema de matchmaking] creado por HoracioStudios.

>### Uso de la librería
>Es importante llamar a la función Init, donde se pasará por parámetro tanto la IP en la que está alojado el servidor como el puerto.

[sistema de matchmaking]: https://github.com/HoracioStudios/Matchmaking-Server


## Métodos

Esta DLL incluye diversos metodos para la búsqueda de un jugador al nivel del buscador. Todos los métodos que devuelven `ServerMessage`, pueden ser casteados a `REST_Error` si el código devuelto es distitnto al código 200. Los metodos que incluyen esta DLL son:

- `void Init(string IP, string PORT)`: Inicialización de IP y puerto en el que se encuentra el servidor de matchmaking.
>
- `ServerMessage LogIn(string password, string username, string version = "1.0.0")`: LogIn en el servidor de matchmaking a partir de un username y una contraseña. Se requiere haber registrado al usuario previamente. Casteo posible: `Login`
>
- `ServerMessage LogOut()`: Desconexión del cliente.
>
- `ServerMessage SignIn(string password, string username, string email)`: Creación de un nuevo usuario a partir de una contraseña, un usuario, y un email. El usuario y contraseña serán las utilizadas posteriormente para la conexión con el servidor.
>
- `ServerMessage GetAvailable(string nick = "", string email = "")`: Comprobación de que un nick y/o email no está ya registrado. Casteo posible: `Available`
>
- `ServerMessage SendRoundInfo(GameData gameData)`: Envío de los datos de la partida jugada.
>
- `ServerMessage AddToQueue()`: Añade un usuario a la búsqueda del emparejamiento.
>
- `ServerMessage SearchPair(float waitTime)`: Pregunta al servidor si ha encontrado contrincante. Se debe pasar por parámetro el tiempo que lleva en búsqueda el jugador. Casteo posible: `PairSearch`
>
- `ServerMessage LeaveQueue()`: Saca al usuario de la cola de búsqueda.
>
- `ServerMessage Refresh()`: Refresca el token de acceso al servidor de matchmaking. Casteo posible: `RefreshMessage`
>
- `ServerMessage GetInfo(int id)`: Devuelve la información del usuario con el id pasado por parámetro. Casteo posible: `UserDataSmall`

## Clases serializables

El envío de datos entre el servidor de matchmaking y esta librería dinámica se realiza a partir de strings en formato Json. Para ello, es necesario el uso de clases serializables y la utilización de la librería dinámica Newtonsoft.Json. Todas las clases utilizadas son:

- `public LoginInfo` con las variables:
    - `public string nick`
    - `public string email`
    - `public string password`
    - `public string version` 
>
- `public RoundResult` con constructora `RoundResult(float res)` y variable:
    - `public float result`
>
- `public GameData` con las variables:
    - `public RoundResult[] rounds`
    - `public int rivalID = 0`
    - `public float rivalRating = 0`
    - `public float rivalRD = 0`
    - `public float myRating = 0`
    - `public float MyRD = 0`
>
-  `public RefreshData` con la variable:
    - `public string refreshToken`
>
- `ServerMessage` con la variable:
    - `public int code = 0`
>
- `RefreshMessage` hereda de `ServerMessage` y con la variable:
    - `public string accessToken`
>
- `REST_Error` hereda de `ServerMessage` y con la variable:
    - `public string accessToken`
>
- `Login` hereda de `ServerMessage` y con las variables:
    - `public int id`
    - `public string accessToken`
    - `public string refreshToken`
>
- `Available` hereda de `ServerMessage` y con las variables:
    - `public bool emailAvailable = false`
    - `public bool nickAvailable = false`
>
- `PairSearch` hereda de `ServerMessage` y con las variables:
    - `public bool found = false`
    - `public bool finished = false`
    - `public int rivalID = -1`
    - `public float bestRivalRating = 1500`
    - `public float bestRivalRD = 0`
    - `public float myRating = 1500`
    - `public float myRD = 0`
>
- `GameEndMessage` hereda de `ServerMessage` y con la variable:
    - `public GameData accessToken`
>
- `UserDataSmall` hereda de `ServerMessage` y con las variables:
    - `public int id`
    - `public string nick`
    - `public string email`
    - `public float rating`
    - `public float RD`
    - `public string creation`
    - `public int wins`
    - `public int draws`
    - `public int losses`
    - `public int totalGames`
