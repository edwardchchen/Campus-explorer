import Typography from "@material-ui/core/Typography";
import {Box, Button, Container, Divider, Grid, TextField} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
const useStyles = makeStyles((theme) => ({
	button:{
		marginTop: 30,
	},
}));

export default function QueryPage(props){
	let classes = useStyles();
	return(
		<Container>
			<Typography align={'left'} variant="h4"
						// className={classes.title}
			>
				Find course attributes
			</Typography>
			<Divider/>
			<Grid container spacing={1}>
				<Grid item xs={3}>
					<TextField id="outlined-basic" label="Year (e.g. 2014)" variant="outlined" margin="normal" />
				</Grid>
				<Grid item xs={3}>

				<TextField id="outlined-basic" label="Department (e.g. cpsc)" variant="outlined" margin="normal" />
				</Grid>
				<Grid item xs={3}>

				<TextField id="outlined-basic" label="ID (e.g. 310)" variant="outlined" margin="normal" />
				</Grid>
				<Grid item xs={3}>
					<Button className={classes.button} color='primary' size='medium' variant='contained'>
						Submit
					</Button>
				</Grid>
			</Grid>
			<Typography align={'left'} variant="h4"
				// className={classes.title}
			>
				Find room attributes
			</Typography>
			<Divider/>
			<Grid container spacing={1}>
				<Grid item xs={3}>
					<TextField id="outlined-basic" label="Building Name (e.g. DMP)" variant="outlined" margin="normal" />
				</Grid>
				<Grid item xs={3}>

					<TextField id="outlined-basic" label="Room number (e.g. 310)" variant="outlined" margin="normal" />
				</Grid>
				<Grid item xs={3}>
					<Button className={classes.button} color='primary' size='medium' variant='contained'>
						Submit
					</Button>
				</Grid>
			</Grid>

		</Container>
	)
}
