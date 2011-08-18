<?php

/**
 * This is the model base class for the table "menu".
 * DO NOT MODIFY THIS FILE! It is automatically generated by giix.
 * If any changes are necessary, you must set or override the required
 * property or method in class "Menu".
 *
 * Columns in table "menu" available as properties of the model,
 * followed by relations of table "menu" available as properties of the model.
 *
 * @property integer $id
 * @property string $name
 *
 * @property MenuItem[] $menuItems
 */
abstract class BaseMenu extends GxActiveRecord {

	public static function model($className=__CLASS__) {
		return parent::model($className);
	}

	public function tableName() {
		return 'menu';
	}

	public static function label($n = 1) {
		return Yii::t('app', 'Menu|Menus', $n);
	}

	public static function representingColumn() {
		return 'name';
	}

	public function rules() {
		return array(
			array('name', 'required'),
			array('name', 'length', 'max'=>45),
			array('id, name', 'safe', 'on'=>'search'),
		);
	}

	public function relations() {
		return array(
			'menuItems' => array(self::HAS_MANY, 'MenuItem', 'menu_id'),
		);
	}

	public function pivotModels() {
		return array(
		);
	}

	public function attributeLabels() {
		return array(
			'id' => Yii::t('app', 'ID'),
			'name' => Yii::t('app', 'Name'),
			'menuItems' => null,
		);
	}

	public function search() {
		$criteria = new CDbCriteria;

		$criteria->compare('id', $this->id);
		$criteria->compare('name', $this->name, true);

		return new CActiveDataProvider($this, array(
			'criteria' => $criteria,
			'pagination'=>array(
        'pageSize'=>Yii::app()->params['pagination.pageSize'],
      ),
		));
	}
}