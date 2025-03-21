const berekenWorp = function(aantalDobbelstenen:number, dubbel: boolean, vorigeWorp = 0 as number) {
    let res = 0
    for (let i = 0; i < aantalDobbelstenen; i++) {
        res += Math.ceil(Math.random() * 6)
    }
    if (!vorigeWorp) {
        vorigeWorp = res
    } else {
        res += vorigeWorp
    }

    if (dubbel)  {
        res = berekenWorp(aantalDobbelstenen, false, vorigeWorp)
    }
    return res
}

export default berekenWorp