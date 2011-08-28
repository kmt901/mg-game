<?php

class GamesModule extends CWebModule
{
	private static $_assetsUrl;   
    
	public function init()
	{
		// this method is called when the module is being created
		// you may place code here to customize the module or the application

		// import the module-level models and components
		$this->setImport(array(
			'games.models.*',
			'games.components.*',
		));
	}

	public function beforeControllerAction($controller, $action)
	{
		if(parent::beforeControllerAction($controller, $action))
		{
			// this method is called before any module controller action is performed
			// you may place customized code here
			return true;
		}
		else
			return false;
	}
  
  public static function getAssetsUrl() {
    if (self::$_assetsUrl === null) {
      self::$_assetsUrl = Yii::app()->getAssetManager()->publish(
            Yii::getPathOfAlias('application.modules.games.assets'),false,-1,YII_DEBUG);
    }
    return self::$_assetsUrl;
  }
  
  public static function listActiveGames() {
    $criteria=new CDbCriteria;
    $criteria->select='unique_id';  // only select the 'title' column
    $criteria->condition='active=1';
    $models = Game::model()->findAll($criteria);  
    
    $games = array();
    foreach ($models as $model) {
      $games[] = self::loadGame($model->unique_id);
    }
    return $games;
  }
  
  /**
   * This method loads a game with the given unique id
   * 
   * @param string $unique_id The unique id of the game
   * @param boolean $active If true it will check whether the game is active
   * @return object The game as object or null if the game could not be found
   */
  public static function loadGame($unique_id, $active=true) {
    $game = null;
      
    $registered_game = null;
    
    if ($active) {
      $criteria=new CDbCriteria;
      $criteria->params='unique_id=:unique_id';
      $criteria->condition='active=1';
      $registered_game = Game::model()->find($criteria, array(':unique_id'=>$unique_id)); 
    }
    
    if ($registered_game || !$active) {
      $game = (object)Yii::app()->fbvStorage->get("games." . $unique_id, array(
          'name' => '',
          'description' => '',
        ));
      if ($registered_game) {
        $game->game_id = $registered_game->id;  
      }
      $game->url =  Yii::app()->createUrl('games/'.$unique_id);
      $game->image_url =  self::getAssetsUrl() . '/' . strtolower($unique_id) . '/images/' . (isset($game->arcade_image)? $game->arcade_image : '');
      $game->api_base_url = Yii::app()->getRequest()->getHostInfo() . Yii::app()->createUrl('/api');
      $game->base_url = Yii::app()->getRequest()->getHostInfo();
      
      $game->user_name = Yii::app()->user->name;
      if (!Yii::app()->user->isGuest) {
        $game->user_score =  110; // make dynamic
      } else {
        $game->user_score =  0;  
      }
      $game->user_authenticated = !Yii::app()->user->isGuest;
    }
    return $game;
  }

  public static function getGameEngine($unique_id) {
    
    $game_engine = null;
    
    try {
      Yii::import("games.components.*");
      $game_engine = Yii::createComponent($unique_id. "Game");
    } catch (Exception $e) {
      throw new CHttpException(500, Yii::t('app', 'Internal Server Error.'));
    } 
    
    return $game_engine;
  }
}