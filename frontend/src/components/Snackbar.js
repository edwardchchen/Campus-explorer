import {Alert} from "@material-ui/lab";
import React from "react";
import {Snackbar} from "@material-ui/core";
export default function Warning(props){

	// const handleClose=()=>{
	// 	setOpen(false)
	// }

	return(
		<Snackbar open={props.open} autoHideDuration={6000}>
			<Alert severity="success" sx={{ width: '100%' }}>
				{props.message}
			</Alert>
		</Snackbar>

	)


}
