import React from 'react'
import { Button, Header, Icon, Modal } from 'semantic-ui-react'

function DragAndDropModal() {
    return (
        <div style={{
            position:"fixed",
            height:"100%",
            width:'100%',
            backgroundColor:'rgba(0,0,0,0.8)',
            pointerEvents: "none"
        }}>
            <Header  icon className={'position-absolute top-50 start-50 translate-middle'}>
                <Icon name='archive' inverted />
            </Header>
        </div>
    )
}

export default DragAndDropModal;
