import { Switch, Route } from "react-router-dom";
import RoleManage from "./demos/RoleManage";
function RouterView() {
  return (
      <Switch>
        <Route path="/roleManage" component={RoleManage} />
      </Switch>
  );
}
export default RouterView;
