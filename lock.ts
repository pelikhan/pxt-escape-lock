// TODO pre-program the digit and digit index
// ASSUME 4 digit locks
let digitIndex = 0;
let key = [3,7,9,1]; // key of combination lock
let secret = 121915; // code sent by player

let allLocksStatus = 0;
let status = escape.LOCK_CLOSED;

function checkCode(code: number) {
    if (secret == code) {
        status = escape.LOCK_OPEN;
        updateStatus(digitIndex, status); // update selft status
    }
}

function updateStatus(index: number, status: number) {
    if (status == escape.LOCK_OPEN)
        allLocksStatus |= 1 << index;
    else
        allLocksStatus &= ~(1 << index); 
}

// broadcast status
basic.forever(function () {
    const b = control.createBuffer(3);
    b[0] = escape.LOCK_STATUS;
    b[1] = digitIndex;
    b[2] = status;
    radio.sendBuffer(b);
    basic.pause(2000)
})

// receive code message from the user
radio.onReceivedBuffer(msg => {
    switch (msg[0]) {
        case escape.CODE:
            checkCode(msg.getNumber(NumberFormat.UInt32LE, 1));
            break;
        case escape.LOCK_STATUS:
            updateStatus(msg[1], msg[2]);
            break;
    }
})

// displace
basic.forever(function () {
    const allUnlocked = 
        (allLocksStatus & escape.ALL_UNLOCKED) == escape.ALL_UNLOCKED;
    if (status == escape.LOCK_CLOSED) {
        basic.showIcon(IconNames.Ghost);
    } else if (!allUnlocked) {
        basic.showIcon(IconNames.Happy);
    } else {
        basic.showNumber(key[digitIndex]);
    }
})

