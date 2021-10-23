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
            <Header style={{
                color:"white",
                position: 'relative',
                top: '50%',
                webkitTransform: 'translateY(-50%)',
                transform: 'translateY(-50%)'
            }} icon >
                <Icon name='archive' />
                <p className='font-weight-light'>Drag and drop 3d files</p>
            </Header>
        </div>
    )
}

export default DragAndDropModal;
