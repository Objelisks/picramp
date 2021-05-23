import { picrewApi } from "./picrewApi.js";
import { findOrCreatePicrew } from './fileUpload.js'

export const cleanupPicrews = async () => {
    // delete all existing picrews
    const picrews = await picrewApi.find('picrew')
    if(picrews.payload.records.length > 0) {
        await picrewApi.delete('picrew', picrews.payload.records.map(x => x.id))
    }

    // get all existing pics
    const pics = await picrewApi.find('pic')

    console.log(`${pics.payload.records.length} pics found`)

    let count = 0

    const picMap = {}

    // for each pic, find or create picrew
    pics.payload.records.forEach(pic => {
        const fileName = pic.url.slice(8)
        const nameParts = fileName.split("_")
        const picrewUrl = nameParts[0]
        const out = { newPicrew: false }
        findOrCreatePicrew(picrewUrl, pic.id, out).then((picrew) => {
            console.log(picrew)
            if(out.newPicrew) {
                console.log('created picrew', picrew.name)
                count += 1
            }
            picrewApi.update('pic', { 
                id: pic.id, 
                replace: {
                    picrew: picrew.id
                }
            })
        })
    })

    console.log(`${count} picrews recreated`)
}