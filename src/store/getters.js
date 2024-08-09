const getters = {
    token: state => state.user.token,
    avatar: state => state.user.avatar,
    name: state => state.user.name,
    role: state => state.user.role,
    visitedViews: state => state.tagsView.visitedViews,
    cachedViews: state => state.tagsView.cachedViews,
    permission_routes: state => state.permission.routes,
    globalState: state => state.globalState
};
export default getters;
