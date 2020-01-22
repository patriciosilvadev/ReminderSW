import React, { useState, useEffect } from "react";
import { List, ListItem } from "@material-ui/core";
import axios from "axios";
import Cookies from 'universal-cookie';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Button, Paper, FormControlLabel,ListItemText } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import EnvVariables from "../EnvVariables";
import IconButton from '@material-ui/core/IconButton';


const useStyles = makeStyles(theme => ({
    row: {
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
    },
    col: {
        display: "flex",
        alignItems: "center",
        flexDirection: "column"
    }
}));


function Template(props) {
    const classes = useStyles();

    const cookies = new Cookies();
    const token = cookies.get('dateReminder-AuthToken')

    const [templateList, setTemplateList] = useState([]);
    const [templates, setTemplates] = useState();

    const [open, setOpen] = React.useState(false);
    const [newTemplate, setNewTemplate] = useState({ name: "", description: "" });

    const [render, setRender] = useState(0);

    useEffect(() => {
        axios.get('/api/user/templates',
            { headers: { authorization: "Bearer " + token } })
            .then((res) => {
                console.log("Cose");
                console.log(res.data);
                setTemplateList(res.data)
            })
            .catch((err) => {
                console.log(err)
            })
    }, [render])

    useEffect(() => {

        if (typeof templateList !== "undefined") {

            setTemplates(templateList.map(template => {

                return (
                    <ListItem key={template._id}>
                        <div className={classes.row} style={{ width: "100%", justifyContent: "space-between" }}>
                            <ListItemText primary={template.name} secondary={template.description} />

                            <IconButton onClick={() => deleteTemplate(template._id)}>
                                <CloseIcon />
                            </IconButton>
                           
                        </div>
                    </ListItem>
                )
            }))
        }

    }, [templateList])

    const deleteTemplate = (_id) => {
        axios.post('/api/user/templates/delete',
            { _id: _id },
            { headers: { authorization: "Bearer " + token } })
            .then((res) => {
                setRender(prev => prev + 1)
            })
            .catch((err) => {
                console.log(err)
            })
    }

    const saveTemplate = () => {
        console.log("Template da aggiungere: ");
        console.log(newTemplate);
        axios.post('/api/user/templates/add',
            { name: newTemplate.name, description:newTemplate.description },
            { headers: { authorization: "Bearer " + token } })
            .then((res) => {
                setOpen(false)
                setNewTemplate({ name: "", description: "" })
                setRender(prev => prev + 1)
            })
            .catch((err) => {
                console.log(err)
            })
    }

    useEffect(() => {
        console.log(newTemplate)
    }, [newTemplate])

    function addVarToTemplate(e){
        console.log("New Tmp");
        console.log(newTemplate) //qui mi da newTemplate al valore di default, il che non ha alcun senso
        const newText = newTemplate.description + e.variable + " "
        console.log(newText);
        setNewTemplate({ ...newTemplate, description: newText })

    }

    return (
        <div>
            {(templateList.length === 0) ?
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                    <AddCircleOutlineIcon style={{ margin: 10 }} />
                    <p>Aggiungi il tuo primo template</p>
                </div>
                :
                <List>
                    {templates}
                </List>
            }

            <Button
                color="primary"
                variant="contained"
                style={{ width: "100%" }}
                onClick={() => { setOpen(true) }}
            >Aggiungi nuovo template</Button>

            <Dialog
                open={open}
                onClose={() => { setOpen(false) }}
            >
                <DialogTitle id="alert-dialog-title">{"Aggiungi nuovo template"}</DialogTitle>
                <DialogContent>

                    <TextField label="Titolo"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                        style={{ width: "100%" }} />

                    <TextField
                        id="standard-multiline-static"
                        label="Testo"
                        multiline
                        rowsMax="5"
                        rows="3"
                        value={newTemplate.description}
                        onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                        style={{ width: "100%", marginTop: 10 }}
                    />

                    <EnvVariables
                        onClick={(e) => addVarToTemplate(e)}
                    />

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setOpen(false) }} color="primary">
                        Annulla
                </Button>
                    <Button onClick={saveTemplate} color="primary" autoFocus>
                        Salva
                </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default Template