// TODO pre-program the digit and digit index
// ASSUME 4 digit locks
const digitIndex = 2;
let allLocksStatus = 0;
let status = 0;

basic.showString("LOCK" + digitIndex)

function reset() {
    allLocksStatus = 0;
    status = escape.LOCK_CLOSED;
}
reset();

function checkCode(code: number) {
    if (status != escape.LOCK_OPEN &&
        escape.codes[digitIndex] == code) {
        status = escape.LOCK_OPEN;
        updateStatus(digitIndex, status); // update self status
    }
}

function updateStatus(index: number, status: number) {
    if (status == escape.LOCK_OPEN)
        allLocksStatus |= 1 << index;
    else
        allLocksStatus &= ~(1 << index); 
}

// broadcast status every 1000 ms
basic.forever(function () {
    if (status == escape.LOCK_CLOSED)
        led.toggle(0, 0)
    const b = control.createBuffer(3);
    b[0] = escape.LOCK_STATUS;
    b[1] = digitIndex;
    b[2] = status;
    radio.sendBuffer(b);
    basic.pause(1000)
})

// receive code message from the user
radio.onReceivedBuffer(msg => {
    escape.logMessage(msg)
    switch (msg[0]) {
        case escape.RESET:
            reset(); 
            break;
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
        basic.clearScreen()
    } else if (!allUnlocked) {
        basic.showIcon(IconNames.Happy);
    } else {
        basic.showNumber(escape.key[digitIndex]);
    }
})

