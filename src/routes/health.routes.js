import { Router } from "express"
const router= Router()

router.get('/health-check',(req,res)=>{
    res.status(200).json({
        "success":true,
        "message":"OK"
    })
})

export default router