import {
    Button,
    Segment,
    List,
    Header,  SegmentGroup
} from "semantic-ui-react";
import {storeMain} from "../../../../Bridge";
import {Log, Settings} from "../../../../Globals";
import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import {SceneObject} from "../../Entities/SceneObject";
import {action, observable, runInAction} from "mobx";
import {sceneStore, SceneUtils } from "../../SceneStore";

@observer
class SelectObjectsView extends Component<any, any> {
    render() {
        if(sceneStore.needUpdateSelectTool)
        {
            runInAction(()=>{
                sceneStore.needUpdateSelectTool = false;
            })
        }

        let list: any = sceneStore.objects.map((t) => {
            let obj = SceneObject.GetByName(sceneStore.objects, t.name);

            if(obj === null)
            {
                Log("Error! SceneComponent object by name is null");
                return <div></div>;
            }

            return (
                <List.Item key={t.name} name={t.name} onClick={(e, p)=>{
                    for(let object of sceneStore.objects)
                    {
                        if(p.name === object.name)
                        {
                            //console.log(object.name)
                            object.isSelected = !object.isSelected;
                            SceneUtils.selectionChanged();
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
                        paddingLeft:'5px',
                        paddingBottom:'5px',
                        paddingTop:'5px',
                        backgroundColor: (obj != null && obj.isSelected ? 'rgba(91,91,255,0.62)' : 'rgba(56,56,56,0.26)'),
                        borderRadius:'3px',
                        cursor:"pointer"
                    }}>
                        <text color='grey' >
                            {t.name}
                        </text>
                    </div>
                </List.Item>
            )
        });

        list = <List>{list}</List>

        return (
            <SegmentGroup size={"tiny"} color='black' style={{
                width: '100%',
                height: 'auto'
            }}>
                <Segment inverted >
                    <Header as='h4'>
                        Selected objects
                    </Header>
                </Segment>
                <Segment inverted >
                    <div style={{
                        width: "100%",
                        height: '12vh',
                        overflowY:"auto"
                    }}>
                        {list}
                    </div>
                </Segment>
                <Segment  inverted>
                    <Button.Group basic size='mini' inverted>
                        <Button icon='plus' onClick={()=>{
                            for(let object of sceneStore.objects)
                            {
                                object.isSelected = true;
                            }
                            SceneUtils.selectionChanged();
                            this.setState({});
                        }}/>
                        <Button icon='minus' onClick={()=>{
                            for(let object of sceneStore.objects)
                            {
                                object.isSelected = false;
                            }
                            SceneUtils.selectionChanged();
                            this.setState({});
                        }}/>
                    </Button.Group>
                </Segment>
            </SegmentGroup>
        );
    }
}

export default SelectObjectsView;
