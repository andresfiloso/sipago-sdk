https://docs.sipago.coop/docs/

Requisitos para integar
Credenciales
Para comenzar a trabajar con nuestra API para generar links de pago deberás contar con tus credenciales de acceso. Las
mismas están compuestas por:

client_id Clave pública de la aplicación. Debes usarla solo para tus integraciones.
client_secret Clave privada de la aplicación para generar pagos. Debes usarla solo para tus integraciones. Recuerda que no debes compartirla ni utilizarla fuera del servidor.
base_url Consultar en la sección Ambientes/Auth Server.
Obtener el token (JWT)
Con el client ID y la secret podemos solicitar al servicio de autenticación un JWT que nos permita
interactuar con la API de Checkout.

php
node
curl
var request = require('request');
var options = {
  'method': 'POST',
  'url': 'https://{base_url}/oauth/token',
  'headers': {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    "grant_type": "client_credentials",
    "client_id": "XXXXXXX-XXX-XXXX-XXX-XXXXXXXXXXXX",
    "client_secret": "XXXXXXXXXX",
    "scope": "*"
  })

};
request(options, function (error, response) {
  if (error) throw new Error(error);
  console.log(response.body);
});

Nos va a devolver un JSON con los siguientes datos:

    {
    "token_type": "Bearer",
    "expires_in": "3600",
    "access_token":"xxxxxxxxxxxxx",
    "refresh_token":"xxxxxxxxxxxxx"
    }

El atributo que vamos a utilizar para las próximas interacciones con las APIs será access_token

----------------------- 
https://docs.sipago.coop/docs/API%20Cobros/IntegracionCheckout

Integración Checkout
Integrar SiPago Checkout te permite cobrar a través de nuestro formulario web desde cualquier dispositivo
de manera simple, rápida y segura.

1. Generar intención de pago
Este paso deberás realizarlo desde tu backend.

Si todavía no generaste el JWT para autenticarte podés ver la
sección Requisitos para integrar

A través de un POST a {base_url}/api/v2/orders se creará la intención de pago.

Consultar {base_url} en la sección Ambientes/Checkout.

php
node
curl
var request = require('request');
var options = {
'method': 'POST',
'url': 'https://{base_url}/api/v2/orders',
'headers': {
  'Authorization': 'Bearer XXXXXX',
  'Content-Type': 'application/vnd.api+json'
},
body: JSON.stringify({
  "data": {
    "attributes": {
      "redirect_urls": {
        "success": "https://dominio.com/?ref=ok",
        "failed": "https://dominio.com/?ref=fallo"
      },
      "currency": "032",
      "shipping": {
        "name": "Precio fijo",
        "price": {
          "currency": "032",
          "amount": 2000
        }
      },
      "items": [
        {
          "id": 31,
          "name": "Silla Eames Base Madera",
          "unitPrice": {
            "currency": "032",
            "amount": 1000
          },
          "quantity": 1
        }
      ]
    }
  }
})

  };
request(options, function (error, response) {
if (error) throw new Error(error);
console.log(response.body);
});

2. Agregá el Checkout a tu sitio
Con la intención de pago generada en el paso anterior, en tu frontend puedes agregar el link del Checkout en tu sitio en
el lugar que quieras que aparezca.

<!doctype html>
<html>
  <head>
    <title>Pagar</title>
  </head>
  <body>
    <a href="<?php echo $order->data->links->checkout; ?>">Pagar con SiPago</a>
  </body>
</html>

Recorda que la intencion de pago tiene una duracion de 10 minutos.

3. Pago
Ya terminamos la integración. Ahora el comprador podrá continuar con el flujo en nuestro Checkout web.


---------------------
https://docs.sipago.coop/docs/API%20Cobros/integracionAvanzada

Integración avanzada
Las siguientes características son opcionales y las podés utilizar en tus integraciones.

Para hacer un uso correcto de la API consultar base_url en la sección Ambientes/Checkout.

Monto del envío
Al crear una orden desde el endpoint api/v2/orders, tenes la posibilidad de sumar el costo del envío y mostrarlo como un ítem dentro del detalle de elementos.

Configuración
Para configurarlo, basta con agregar el nodo shipping con el nombre name y el sub nodo price con el valor del monto del envío y la moneda a utilizar.

    "shipping": {
        "name": "Envio por Correo Argentino",
        "price": {
            "currency": "032",
            "amount": 601
        }
    }

Detalles
Campo	Tipo de campo	Puede ser nulo
name	string	si
currency	string	No
amount	integer	No
Nota:
El campo "amount" es un número entero en el que los últimos dos dígitos. Por lo tanto, se si desea cobrar 200,69 pesos el valor de "amount" es 20069

Ejemplo
php
node
curl
var request = require('request');
var options = {
'method': 'POST',
'url': 'https://{base_url}/api/v2/orders',
'headers': {
  'Authorization': 'Bearer XXXXXX',
  'Content-Type': 'application/vnd.api+json'
},
body: JSON.stringify({
  "data": {
    "attributes": {
      "currency": "032",
      "shipping": {
        "name": "Precio fijo",
        "price": {
          "currency": "032",
          "amount": 2000
        }
      },
      "items": [
        {
          "id": 31,
          "name": "Silla Eames Base Madera",
          "unitPrice": {
            "currency": "032",
            "amount": 1000
          },
          "quantity": 1
        }
      ]
    }
  }
})

  };
request(options, function (error, response) {
if (error) throw new Error(error);
console.log(response.body);
});

URL de retorno
Al finalizar el proceso de pago, tienes la opción de redireccionar al comprador tanto para pagos aprobados como para pagos rechazados.

Configuracion
Esta característica da la opción de sumar el nodo redirect_urls y definir dentro un link para success y un link para failed.

    "redirect_urls": {
        "success": "https://www.mitienda.com/?ref=ok",
        "failed": "https://www.mitienda.com/?ref=fallo"
    }

Detalles
Campo	Tipo de campo	Puede ser nulo
success	string	si
failed	string	si
Nota:
Solo se soporta dominios con el protocolo HTTPS

Ejemplo
php
node
curl
var request = require('request');
var options = {
'method': 'POST',
'url': 'https://{base_url}/api/v2/orders',
'headers': {
  'Authorization': 'Bearer XXXXXX',
  'Content-Type': 'application/vnd.api+json'
},
body: JSON.stringify({
  "data": {
    "attributes": {
      "redirect_urls": {
        "success": "https://www.mitienda.com/?ref=ok",
        "failed": "https://www.mitienda.com/?ref=fallo"
      },
      "currency": "032",
      "items": [
        {
          "id": 31,
          "name": "Silla Eames Base Madera",
          "unitPrice": {
            "currency": "032",
            "amount": 1000
          },
          "quantity": 1
        }
      ]
    }
  }
})

  };
request(options, function (error, response) {
if (error) throw new Error(error);
console.log(response.body);
});

Webhook URL
Sirve para que al momento de finalizar un pago, notifiquemos el estado del mismo.

Configuracion
Simplemente agregar la key webhookUrl en la raíz de attributes y colocar la URL al cual enviaremos la notificación.

"webhookUrl": "https://www.midominio.com/?ref=soyunhook"

Detalles
Campo	Tipo de campo	Puede ser nulo	Longitud
webhookUrl	string	sí	255
Ejemplo
php
node
curl
var request = require('request');
var options = {
'method': 'POST',
'url': 'https://{base_url}/api/v2/orders',
'headers': {
  'Authorization': 'Bearer XXXXXX',
  'Content-Type': 'application/vnd.api+json'
},
body: JSON.stringify({
  "data": {
    "attributes": {
      "redirect_urls": {
        "success": "https://dominio.com/?ref=ok",
        "failed": "https://dominio.com/?ref=fallo"
      },
    "webhookUrl": "https://dominio.com/?ref=soyunhook",
      "currency": "032",
      "items": [
        {
          "id": 31,
          "name": "Silla Eames Base Madera",
          "unitPrice": {
            "currency": "032",
            "amount": 1000
          },
          "quantity": 1
        }
      ]
    }
  }
})

  };
request(options, function (error, response) {
if (error) throw new Error(error);
console.log(response.body);
});

Estados del Webhook
Cuando el webhook notifica sobre el estado de una orden de compra o una intención de pago, puede devolver los siguientes estados (order.status), cada uno indicando una situación específica en el ciclo de vida de la orden o del pago:

PENDING: La orden de compra ha sido creada y la intención de pago está pendiente. Esto significa que el usuario aún no ha completado el proceso de pago.

EXPIRED: La intención de pago ha alcanzado un estado de "FAILED" o "EXPIRED". Este estado se utiliza para indicar que el tiempo disponible para realizar el pago ha expirado o que el intento de pago no fue exitoso.

FAILED_CHECKOUT: La intención de pago está en estado "ERROR". Esto puede ocurrir por diversos motivos relacionados con el proceso de checkout, como problemas con los datos de pago proporcionados por el usuario.

FAILED: Se presenta cuando el proceso de creación de la orden falla, usualmente debido a un fallo en la creación de la intención de pago. Este estado indica problemas en las etapas preliminares antes de que el usuario intente realizar el pago.

SUCCESS: La intención de pago ha sido completada satisfactoriamente. Esto indica que el pago ha sido procesado y aceptado.

Cada uno de estos estados requiere una gestión específica por parte del sistema que recibe las notificaciones del webhook, asegurando que se manejen adecuadamente las distintas situaciones que pueden presentarse en el proceso de compra y pago.

Ejemplo de POST al WebHook en caso de éxito
    {
      "data": {
        "type": "Payment",
        "order": {
          "uuid": "ea138a99-c9df-44a5-b2bf-09e5db6f8d0c",
          "status": "SUCCESS",
          "source": "app_payment_link"
        },
        "payment": {
          "id": 1823,
          "authorizationCode": "901159",
          "refNumber": "62b4a8ff60fee",
          "status": "APPROVED"
        }
      }
    }

Ejemplo de POST al WebHook en caso de error
    {
      "data": {
        "type": "Payment",
        "order": {
          "uuid": "bd499ea5-79f8-4f18-b18d-dfbef7987f52",
          "status": "PENDING",
          "source": "api_checkout"
        },
        "payment": {
          "id": 7364888,
          "refNumber": "65df288a484b5",
          "status": "DENIED"
        }
      }
    }

Nota
El WebHook intentará realizar 4 llamados al endpoint especificado en un lapso aproximado de 2 minutos entre cada llamado. Esto se hace para asegurar la entrega del mensaje en caso de que el primer intento falle. Es importante tener en cuenta este comportamiento para la gestión adecuada de los mensajes recibidos.

expireLimitMinutes
Establece un tiempo limite para realizar el pago. Una vez vencido dicho tiempo, el pago ya no podrá realizarse.

Consideraciones importantes sobre expireLimitMinutes
Cuando se configura expireLimitMinutes para establecer un tiempo límite para realizar el pago, es importante tener en cuenta el comportamiento del sistema una vez que se supera este tiempo límite:

Si el checkout se abre luego de haber pasado el tiempo de expiración: La página mostrará un error indicando "Tu link de pago expiró". Esto significa que el usuario no podrá proceder con el pago debido a que el tiempo configurado para realizarlo ha sido superado.

Si el checkout es abierto inmediatamente y el pago se intenta realizar una vez pasado el tiempo de expiración: En este caso, a pesar de que el usuario haya iniciado el proceso de pago dentro del tiempo límite, si el pago se efectúa después de este tiempo, la página mostrará un mensaje de error "Tuvimos un inconveniente en nuestro sistema".

En cualquiera de los dos escenarios mencionados anteriormente, no se realizará ningún llamado al webhook. Esto es crucial para la gestión de notificaciones y debe ser tenido en cuenta al implementar la lógica de recepción de mensajes en el servidor.

Configuración
Agregar la key expireLimitMinutes en la raíz de attributes y colocar el valor expresado en minutos.

{
  "expireLimitMinutes": 14400
}

Detalles
Campo	Tipo de campo	Puede ser nulo
expireLimitMinutes	integer	No
Ejemplo
php
node
curl
var request = require('request');
var options = {
'method': 'POST',
'url': 'https://{base_url}/api/v2/orders',
'headers': {
  'Authorization': 'Bearer XXXXXX',
  'Content-Type': 'application/vnd.api+json'
},
body: JSON.stringify({
  "data": {
    "attributes": {
      "redirect_urls": {
        "success": "https://dominio.com/?ref=ok",
        "failed": "https://dominio.com/?ref=fallo"
      },
      "currency": "032",
      "items": [
        {
          "id": 31,
          "name": "Silla Eames Base Madera",
          "unitPrice": {
            "currency": "032",
            "amount": 1000
          },
          "quantity": 1
        }
      ],
      "expireLimitMinutes": 14400
    }
  }
})

  };
request(options, function (error, response) {
if (error) throw new Error(error);
console.log(response.body);
});


-----------------------
https://docs.sipago.coop/docs/API%20Cobros/EstadoOrden



Estado de la orden
Cuando se integra SiPago Checkout se genera una intención de pago (entidad Order)

Esta intención es la que luego en el checkout se procede a pagar.

Se puede consultar el estado de la misma para ver si tiene un pago aprobado asociado y si el mismo se encuentra aprobado.

1. Primero generar intención de pago
Este paso deberás realizarlo desde tu backend.

Ya detallado en un paso anterior Integración Checkout

2. Consultar el estado de la intención creada
Se debe reemplazar el valor reemplazar_por_uuid por el UUID de la intención de pago generada en el paso anterior.

Consultar base_url en la sección Ambientes/Checkout.

A través de un GET a base_url/api/v2/orders/reemplazar_por_uuid se consultará el estado de la intención de pago.

php
node
curl
var request = require('request');
var options = {
'method': 'GET',
'url': 'https://{base_url}/api/v2/orders/{reemplazar_por_uuid}',
'headers': {
    'Content-Type': 'application/vnd.api+json'
}
};
request(options, function (error, response) {
if (error) throw new Error(error);
console.log(response.body);
});

Dentro de la variable $order tendremos un json con la intención de pago con la siguiente estructura:

    {
        "data": {
            "id": "/api/v2/orders/0b7f233a-c5ca-4968-9b72-40a239f80355",
            "type": "Order",
            "attributes": {
                "uuid": "0b7f233a-c5ca-4968-9b72-40a239f80355",
                "source": "order_source_example",
                "appId": "SiPago",
                "paymentLimits": 1,
                "orderNumber": "00000001-0000000012",
                "price": {
                    "currency": "032",
                    "amount": 42
                },
                "shipping": null,
                "items": [
                    {
                        "name": "",
                        "quantity": 1,
                        "unitPrice": {
                            "currency": "032",
                            "amount": 42
                        },
                        "itemId": null
                    }
                ],
                "status": "SUCCESS",
                "taxes": [],
                "links": {
                    "checkout": "base_url/orders/0b7f233a-c5ca-4968-9b72-40a239f80355",
                    "redirect_url": {
                        "success": null,
                        "failed": null
                    }
                },
                "hasPendingPayment": false,
                "payment": {
                    "id": 123,
                    "authorization_code": "012345",
                    "reference_number": "62d6c4784212b",
                    "status": "APPROVED"
                },
                "payments": [
                    {
                        "id": 123,
                        "authorization_code": "012345",
                        "reference_number": "62d6c4784212b",
                        "status": "APPROVED"
                    }
                ]
            },
            "links": [
                {
                    "checkout": "base_url/orders/0b7f233a-c5ca-4968-9b72-40a239f80355",
                    "redirect_url": {
                        "success": null,
                        "failed": null
                    }
                }
            ]
        }
    }
-------
https://docs.sipago.coop/docs/API%20Cobros/Ambientes

Ambientes
La base URL especifica la dirección de red de un servicio API. Trendrá a disposición dos base URL, development y production.

Checkout
Ambiente	Base URL
development	https://api-cabal.preprod.geopagos.com
production	https://api.sipago.coop
Auth Server
Ambiente	Base URL	URL Completa
development	https://auth.stg.geopagos.io/	https://auth.stg.geopagos.io/oauth/token
production	https://auth.prd.geopagos.io	https://auth.prd.geopagos.io/oauth/token


---------

https://docs.sipago.coop/docs/API%20Cobros/credencialDev

Credenciales de Desarrollo
Credenciales
Para comenzar a trabajar con nuestra API en ambiente de DESARROLLO(development) puede usar la siguiente

client_id .3c21db0f-6913-43db-88d6-2ced87b99a91
client_secret ft6z30q2ftsmu90au0mp
Soporte para desarrolladores consultas@sipago.coop