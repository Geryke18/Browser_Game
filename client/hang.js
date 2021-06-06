let hangBtn = document.getElementById("selected");
let toHang = document.getElementById("toHang");
hangBtn.onclick = async function hang() {
    let response = await fetch('http://' + location.host + '/hang', {
        method: 'POST',
        body: toHang.value,
        headers: {'Content-Type': ' text/plain'}
    });
    window.location.href = 'http://' + location.host + '/';
}