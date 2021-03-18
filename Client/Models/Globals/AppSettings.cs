namespace Client.Models.Globals
{
    public static class AppSettings
    {
        public enum Modal
		{
			None,
			Profile,
		}
		public static Modal ActiveModal = Modal.None;
        public static string API = "http://api.divinedrop.local";
        public static void OpenModal(Modal modal)
        {
            ActiveModal = modal;
        }
    }
}
