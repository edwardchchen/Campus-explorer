import './App.css';
import {HashRouter, Redirect, Route, Switch} from 'react-router-dom';
import {Container} from "@material-ui/core";
import Navbar from './components/Navbar'
import EditPage from "./pages/EditPage";
import ListPage from "./pages/ListPage";
import {makeStyles} from "@material-ui/core/styles";
import QueryPage from "./pages/QueryPage";
const useStyles = makeStyles((theme) => ({
	container:{
		paddingLeft: theme.spacing(10),
	},
}));

function App() {
	const classes = useStyles()

	return (
	  <div className="App">
		  <HashRouter>
			  <Navbar/>
			  <Container className={classes.container}>
				  <Redirect to="/edit" />
				  <Switch>
					  <Route path ='/edit' exact component={EditPage}/>
					  <Route path ='/list' exact component={ListPage}/>
					  <Route path ='/query' exact component={QueryPage}/>

				  </Switch>
			  </Container>
		  </HashRouter>
	  </div>
  );
}

export default App;
