import React, { Component } from "react";
import { FormGroup, Input, Alert } from "reactstrap";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Menu, MenuItem } from "@material-ui/core";
import NestedMenuItem from "material-ui-nested-menu-item";



// a little function to help us with reordering the result
const reorder = (list: any, startIndex: any, endIndex: any) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};



const getItemStyle = (isDragging: any, draggableStyle: any) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",

    // change background colour if dragging
    background: isDragging ? "lightgreen" : "white",

    // styles we need to apply on draggables
    ...draggableStyle
});

const getListStyle = (isDraggingOver: any) => ({
    background: isDraggingOver ? "lightblue" : "white",

});

interface FilterProps {
    synopsisData: any;
}

interface StateProps {
    userSelectedFilters: any;
    isHover: string;
    isSaved: boolean;
    isMenuOpen: boolean;
    menuPosition: any;
    anchorEl: any;
}

class filters extends Component<FilterProps> {
    state: StateProps = {
        userSelectedFilters: [],
        isHover: "",
        isSaved: false,
        isMenuOpen: false,
        menuPosition: null,
        anchorEl: null
    };

    onDragEnd = (result: any) => {
        // dropped outside the list
        if (!result.destination) {
            return;
        }

        const items = reorder(
            this.state.userSelectedFilters,
            result.source.index,
            result.destination.index
        );

        this.setState({
            userSelectedFilters: items
        });
    }

    onAddFilter = (selectedFilter: string) => {
        if (this.state.userSelectedFilters.filter((e: any) => e.filterName === selectedFilter).length > 0) {
            alert("Filter already added");
            return;
        }
        const userSelectedFilters: any = [...this.state.userSelectedFilters] || [];
        userSelectedFilters.push({
            filterName: selectedFilter,
            filterType: 'Default'
        })
        this.setState({
            userSelectedFilters: userSelectedFilters
        })
    }

    onRemoveFilter = (removedFilter: string) => {
        const newList: any = [...this.state.userSelectedFilters] || [];
        newList.splice(newList.findIndex((i: any) => i.filterName === removedFilter), 1);
        this.setState({
            userSelectedFilters: newList
        })
    }

    selectOptionHandler = (name: any, event: any) => {
        const newList: any = [...this.state.userSelectedFilters] || [];
        const index: number = newList.findIndex((i: any) => i.filterName === name);
        newList[index] = { filterName: name, filterType: event.target.value }
        this.setState({
            userSelectedFilters: newList
        })
    }

    selectedValue = (name: string) => {
        return this.state.userSelectedFilters[this.state.userSelectedFilters.findIndex((i: any) => i.filterName === name)].filterType || 'Default';

    }

    onSaveHandler = () => {
        this.setState({ isSaved: true });
    }

    setMenuPosition = (e: any) => {
        if (this.state.menuPosition) {
            return;
        }
        this.setState({ menuPosition: { top: e.pageY, left: e.pageX } })
    }


    render() {
        return (

            <div>
                <h1>Filters</h1>
                <DragDropContext onDragEnd={this.onDragEnd}>
                    <Droppable droppableId="droppable">
                        {(provided, snapshot) => (
                            <div {...provided.droppableProps}
                                ref={provided.innerRef}
                                style={getListStyle(snapshot.isDraggingOver)}
                                className="p-3 border bg-light">

                                {this.state.userSelectedFilters.map((filter: any, index: any) =>
                                (
                                    <Draggable key={filter.filterName} draggableId={filter.filterName} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={getItemStyle(
                                                    snapshot.isDragging,
                                                    provided.draggableProps.style
                                                )}
                                            >
                                                <div className="row border justify-content-between align-items-center p-2">
                                                    <div className="col-4 d-flex">
                                                        <div className="mr-3">| |</div>
                                                        <div className="mr-3">{filter.filterName}</div>
                                                    </div>
                                                    <div className="col-4 d-flex justify-content-center">
                                                        <div className="mr-3 font-weight-bold">Type</div>
                                                        <FormGroup className="mb-0 mr-3">
                                                            <Input type="select" name="select" id="exampleSelect" value={this.selectedValue(filter.filterName)} onChange={(e: any) => { this.selectOptionHandler(filter.filterName, e) }} >
                                                                <option value={"Default"}>Default</option>
                                                                <option value={"Date"}>Date</option>
                                                                <option value={"Search"}>Search</option>
                                                                <option value={"Store"}>Store</option>
                                                            </Input>
                                                        </FormGroup>
                                                    </div>
                                                    <div className="col-4 d-flex justify-content-end">
                                                        <button className="btn btn-danger" onClick={() => this.onRemoveFilter(filter.filterName)}>
                                                            DELETE
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>

                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                <div>
                    <button className="btn btn-primary mt-3" aria-controls="simple-menu" aria-haspopup="true" onClick={(e) => { this.setState({ isMenuOpen: true, anchorEl: e.currentTarget }) }}>
                        Add Filter
                    </button>
                    <Menu
                        id="simple-menu"
                        anchorEl={this.state.anchorEl}
                        open={this.state.isMenuOpen}
                        onClose={() => { this.setState({ isMenuOpen: false, anchorEl: null }) }}
                        PaperProps={{
                            style: {
                                maxHeight: 300,

                            },
                        }}
                    >

                        {this.props?.synopsisData?.map((data: any) => (
                            <div> {data.sample.length > 0 ?
                                <NestedMenuItem onClick={() => { this.onAddFilter(data.sampleHeader); this.setState({ isMenuOpen: false }) }}
                                    onMouseEnter={() => this.setState({ isHover: (data.sampleHeader) })}
                                    onMouseLeave={() => this.setState({ isHover: "" })}
                                    parentMenuOpen={this.state.isMenuOpen} label={data.sampleHeader}>

                                    {this.state.isHover === (data.sampleHeader) && (
                                        <div style={{ overflow: 'auto', maxWidth: '400px' }}>
                                            {data.sample.map(((sam: any) => (
                                                <MenuItem key={sam}>{sam}
                                                </MenuItem>
                                            )))}
                                        </div>
                                    )
                                    }
                                </NestedMenuItem> : <MenuItem onClick={() => { this.onAddFilter(data.sampleHeader); this.setState({ isMenuOpen: false }) }}>{data.sampleHeader}</MenuItem>
                            }
                            </div>
                        ))}


                    </Menu>
                </div>

                <div className="d-flex flex-row justify-content-end p-4">
                    <button className="btn btn-primary" onClick={this.onSaveHandler}>Save</button>
                </div>
                <div>
                    {this.state.isSaved ? (
                        <Alert color="success">
                            {this.state.userSelectedFilters.map((filter: any, type: any) => (
                                <div>
                                    Filter Name: {filter.filterName}, Type: {filter.filterType}
                                </div>
                            ))}
                            <p>New Filters have been successfully added.</p>
                        </Alert>
                    ) : null}
                </div>

            </div>
        )
    }
}

export default filters;
