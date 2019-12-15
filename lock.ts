// TODO pre-program the digit and digit index
// ASSUME 4 digit locks
const digitIndex = 2;
let allLocksStatus = 0;
let status = escape.LOCK_CLOSED;

basic.showString("LOCK" + digitIndex)

function checkCode(code: number) {
    if (status != escape.LOCK_OPEN &&
        escape.CODES[digitIndex] == code) {
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
escape.onMessageReceived(function (msg: number, data: Buffer) {
    switch (msg) {
        case escape.CODE:
            checkCode(data.getNumber(NumberFormat.UInt32LE, 0));
            break;
        case escape.LOCK_STATUS:
            updateStatus(data[0], data[1]);
            break;
    }
})

// displace
escape.onUpdate(function () {
    const allUnlocked =
        (allLocksStatus & escape.ALL_UNLOCKED) == escape.ALL_UNLOCKED;
    if (status == escape.LOCK_CLOSED) {
        basic.clearScreen()
    } else if (!allUnlocked) {
        basic.showString("UNLOCKED");
    } else {
        basic.showNumber(escape.PHYSICAL_LOCK_KEY[digitIndex]);
    }
})

