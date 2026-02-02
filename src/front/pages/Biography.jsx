import { useState } from "react"


export const Biography = ({ text }) => {
    const [expandTexto, setExpandTexto] = useState(false)

    if (!text) return null

    return (
        <>
            <p style={{ lineHeight: "1.5", color: "#050505" }} >

                {expandTexto ? text : text.slice(0, 58) + ("....")}

                <span style={{ color: "#468BE6", cursor: "pointer", fontWeight: "500" }}
                    onClick={() => setExpandTexto(!expandTexto)} >
                    {expandTexto ? "read less" : "read more "}
                </span>

            </p>
        </>


    )
}