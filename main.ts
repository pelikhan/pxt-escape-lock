// TODO pre-program the digit and digit index
let digitIndex = 0;
let digit = 3;
let secret = 121915;

let allLocksStatus = 0;
let status = escape.LOCK_CLOSED;

function checkCode(code: number) {
    if (secret == code) {
        status = escape.LOCK_OPEN;
    }
}

// broadcast status
basic.forever(function() {
    const b = control.createBuffer(5);
    b[0] = escape.LOCK_STATUS;
    b[1] = digitIndex;
    b[2] = status;
    radio.sendBuffer(b);
    basic.pause(2000)
})

// receive code message from the user
radio.onReceivedBuffer(msg => {
    switch(msg[0]) {
        case escape.CODE:
            checkCode(msg.getNumber(NumberFormat.UInt32LE, 1));
            break;
    }
})

// displace
basic.forever(function() {
    if (status == escape.LOCK_CLOSED) {
        basic.showIcon(IconNames.Ghost);
    } else {

    }
})

