import {
    Icon,
    Table,
    Step,
    Card,
    Button,
    Segment,
    List,
    Checkbox,
    Header,
    Grid,
    GridColumn,
    Feed, Item, Container
} from "semantic-ui-react";
import {storeMain} from "../Bridge";
import {Log, Settings} from "../Globals";
import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import {SceneObject} from "./Scene/SceneObject";
import {action, observable} from "mobx";
import {sceneStoreSelectionChanged} from "./Scene/Scene";

@inject("sceneStore")
@observer
class SelectObjectsView extends Component<any, any> {
    render() {
        let sceneStore = this.props.sceneStore;
        let list = sceneStore.objects.map((t) => {
            let obj = SceneObject.GetByName(sceneStore.objects, t.name);

            if(obj === null)
            {
                Log("Error! Scene object by name is null");
                return <div></div>;
            }

            return (
                <List.Item name={t.name} onClick={(e, p)=>{
                    for(let object of sceneStore.objects)
                    {
                        if(p.name === object.name)
                        {
                            object.isSelected = !object.isSelected;
                            sceneStoreSelectionChanged();
                            this.setState({});
                            break;
                        }
                    }
                }}>
                    <div  style={{
                        display:"flex",
                        flexDirection:'row',
                        justifyContent:"flex-start",
                        textOverflow:"ellipsis",
                        overflow: "hidden",
                        width:'100%',
                        padding:'1vmin',
                        paddingBottom:'1vmin',
                        paddingTop:'1vmin',
                        backgroundColor: (obj != null && obj.isSelected ? 'rgba(0,0,255,0.06)' : 'rgba(0,0,0,0.05)'),
                        borderRadius:'3px',
                        cursor:"pointer"
                    }}>
                        <Checkbox toggle readOnly style={{
                            flex:'0 0 60px'
                        }} checked={obj != null && obj.isSelected}/>

                        <Header as='h5' color='grey' style={{
                            whiteSpace:'nowrap',
                            flex:3
                        }}>
                            {t.name}
                        </Header>
                    </div>
                </List.Item>
            )
        });

        list = <List>{list}</List>

        return (
            <Card style={{
                width: '100%',
                userSelect:"none"
            }}>
                <Card.Content extra>
                    <Card.Header style={{float: 'left'}}>Select objects</Card.Header>
                </Card.Content>
                <Card.Content extra>
                    <div style={{
                        width: "100%",
                        height: '14vh',
                        overflowY:"auto"
                    }}>
                        {list}
                    </div>
                </Card.Content>
                <Card.Content extra>
                    <Button.Group basic size='small'>
                        <Button icon='plus square' onClick={()=>{
                            for(let object of sceneStore.objects)
                            {
                                object.isSelected = true;
                            }
                            sceneStoreSelectionChanged();
                            this.setState({});
                        }}/>
                        <Button icon='plus square outline' onClick={()=>{
                            for(let object of sceneStore.objects)
                            {
                                object.isSelected = false;
                            }
                            sceneStoreSelectionChanged();
                            this.setState({});
                        }}/>
                    </Button.Group>
                </Card.Content>
            </Card>
        );
    }
}

export default SelectObjectsView;
